import logging
from openai import BadRequestError, OpenAI
import chromadb
from chromadb.utils import embedding_functions
from reporting.service.pdf_document_contents_service import PdfDocumentContentsService


logger = logging.getLogger(__name__)

class LMStudioEmbeddingFunction:
    def __init__(self, client: OpenAI, embedding_model: str):
        self._client = client
        self._embedding_model = embedding_model

    def name(self) -> str:
        # Required by newer Chroma versions for embedding function compatibility checks.
        return "lmstudio-openai-embeddings"

    def __call__(self, input):
        response = self._client.embeddings.create(
            input=input,
            model=self._embedding_model,
        )
        return [data.embedding for data in response.data]
        
class LLMService:
    _client = None
    _model = None
    _collection = None
    _embedding_fn = None
    _chroma_client = None

    SERVER_API_HOST = "localhost:1240"
    MODEL_NAME = "cas-chat"
    FALLBACK_MODEL_NAME = "mistralai/ministral-3-14b-reasoning"
    EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
    MAX_CONTEXT_CHARS = 12000
    RETRY_CONTEXT_CHARS = 4000
    MIN_CONTEXT_CHARS = 1000
    MAX_OUTPUT_TOKENS = 512

    @classmethod
    def _get_chat_model_candidates(cls) -> list[str]:
        models: list[str] = []

        for model_name in [cls.MODEL_NAME, cls.FALLBACK_MODEL_NAME]:
            if model_name and model_name not in models:
                models.append(model_name)

        try:
            model_list = cls._client.models.list()
            for item in getattr(model_list, "data", []):
                model_id = getattr(item, "id", None)
                if not model_id:
                    continue
                lowered = model_id.lower()
                if "embed" in lowered or "embedding" in lowered:
                    continue
                if model_id not in models:
                    models.append(model_id)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to list models from LM Studio; using configured model candidates only.")

        return models

    @classmethod
    def initialize(cls):
        if cls._client is None:
            # configure the global LM Studio client
            cls._client = OpenAI(
                base_url=f"http://{cls.SERVER_API_HOST}/v1",
                api_key="lm-studio",  # Required by the SDK syntax, but ignored by LM Studio
            )
            
            # Initialize a local, in-memory vector database
            cls._chroma_client = chromadb.EphemeralClient()


    @classmethod
    def get_extracted_text(cls) -> str | None:
        return PdfDocumentContentsService.get_extracted_text(9)

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        """
        Splits the input text into chunks of a specified size.
        """
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap  # Move the start point forward with overlap

        return chunks
    
    @classmethod
    def prepare_context(cls, extracted_text: str) -> None:
        """
        Prepares the context for the LLM by chunking the extracted text and adding it to the vector database.
        """
        chunks = cls.chunk_text(extracted_text)

        cls._embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=cls.EMBEDDING_MODEL_NAME,
        )
        # Create a collection inside the database to hold your PDF chunks
        cls._collection = cls._chroma_client.get_or_create_collection(
            name="document_context", 
            embedding_function=cls._embedding_fn
        )


        logger.info("Adding %d chunks to the vector database.", len(chunks))
        ids = [f"chunk_{index + 1}" for index in range(len(chunks))]
        metadatas = [{"source": "verification_statement"} for _ in chunks]
        cls._collection.upsert(
            ids=ids,
            documents=chunks,
            metadatas=metadatas,
        )
        logger.info("Added %d chunks to the vector database.", len(chunks))

    @classmethod
    def query_rag_workflow(cls, user_query: str, n_results: int = 3) -> str:
        """
        Queries the vector database for relevant chunks based on the user's query.
        """
        results = cls._collection.query(
            query_texts=[user_query],
            n_results=n_results
        )
        return "\n\n".join(results['documents'][0])

    @classmethod
    def ask_llm_with_pdf(cls, user_query: str) -> str:
        cls.initialize()
        raw_text = cls.get_extracted_text()
        if not raw_text:
            logger.warning("No extracted text found for verification statement.")
            raw_text = ""
        cls.prepare_context(raw_text)
        retrieved_context = cls.query_rag_workflow(user_query, n_results=3)

        system_prompt = (
            "You are a helpful assistant. The context provided is the contents of a Verification " \
            "Statement report submitted by a third-party company in response to a regulatory carbon " \
            "emissions report prepared by an operator. The Verification Statement outlines the verifier's " \
            "findings, including any errors, opinions, and determinations regarding the operator's " \
            "compliance with regulatory requirements. The user will ask questions about the " \
            "Verification Statement, and you should answer based on the context provided. " \
            "Your answers should be concise."
        )

        logger.info("Retrieved context size: %s chars", len(retrieved_context or ""))

        bounded_context = (retrieved_context or "")[: cls.MAX_CONTEXT_CHARS]
        user_prompt = f"Context:\n{bounded_context}\n\nQuestion:\n{user_query}"

        retry_context = bounded_context[: cls.RETRY_CONTEXT_CHARS]
        retry_prompt = f"Context:\n{retry_context}\n\nQuestion:\n{user_query}"
        min_context = bounded_context[: cls.MIN_CONTEXT_CHARS]
        min_prompt = f"Context:\n{min_context}\n\nQuestion:\n{user_query}"
        direct_prompt = user_query

        candidate_models = cls._get_chat_model_candidates()
        logger.info("LLM candidate chat models: %s", ", ".join(candidate_models) if candidate_models else "none")

        attempts = []
        for model_name in candidate_models:
            attempts.extend(
                [
                    (model_name, user_prompt, cls.MAX_OUTPUT_TOKENS),
                    (model_name, retry_prompt, 256),
                    (model_name, min_prompt, 128),
                    (model_name, direct_prompt, 96),
                ]
            )

        response = None
        last_error = None
        for model_name, prompt_text, max_tokens in attempts:
            try:
                response = cls._client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt_text},
                    ],
                    max_tokens=max_tokens,
                    temperature=0.2,
                )
                break
            except BadRequestError as error:
                last_error = error
                logger.warning(
                    "LLM attempt failed for model=%s, max_tokens=%s: %s",
                    model_name,
                    max_tokens,
                    str(error),
                )
                continue
            except Exception as error:  # noqa: BLE001
                last_error = error
                logger.exception(
                    "Unexpected LLM error for model=%s, max_tokens=%s",
                    model_name,
                    max_tokens,
                )
                continue

        if response is None:
            logger.error(
                "All LLM attempts failed with compute-related errors. Returning graceful fallback. Last error: %s",
                str(last_error) if last_error else "unknown",
            )
            return (
                "I could not generate an answer because no loaded LM Studio chat model completed the request. "
                "Please load a smaller instruction/chat model in LM Studio and retry."
            )


        logger.info("LLM response received.")
        message_content = response.choices[0].message.content
        logger.info(message_content)

        return str(message_content)
