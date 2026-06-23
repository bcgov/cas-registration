import camelot
# import fitz
from typing import List
import pandas as pd


class ParseVerificationStatementService:
    # @staticmethod
    # def read_pdf(file_path: str) -> str:
    #     # Use fitz to extract text from the PDF
    #     doc = fitz.open(file_path)
    #     text = ""
    #     for page in doc:
    #         text += page.get_text()
    #     return text

    @staticmethod
    def read_tables(file_path: str) -> List[pd.DataFrame]:
        # Use camelot to extract tables from the PDF
        tables = camelot.read_pdf(file_path, pages='all')
        table_dataframes = []
        for table in tables:
            table_dataframes.append(table.df)
        return table_dataframes
