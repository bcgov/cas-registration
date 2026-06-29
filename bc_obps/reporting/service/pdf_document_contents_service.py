from registration.models.pdf_document_contents import PDFDocumentContents

class PdfDocumentContentsService:
    @classmethod
    def set_extracted_text(cls, report_attachment_id: int, extracted_text: str) -> None:
        pdf_contents = PDFDocumentContents.objects.filter(
            report_attachment_id=report_attachment_id
        ).first()

        if pdf_contents:
            pdf_contents.extracted_text = extracted_text
            pdf_contents.save()
        else:
            PDFDocumentContents.objects.create(
                report_attachment_id=report_attachment_id,
                extracted_text=extracted_text
            )

    @classmethod
    def get_extracted_text(cls, report_attachment_id: int) -> str | None:
        pdf_contents = PDFDocumentContents.objects.filter(
            report_attachment_id=report_attachment_id
        ).first()

        if pdf_contents:
            return pdf_contents.extracted_text
        else:
            return None