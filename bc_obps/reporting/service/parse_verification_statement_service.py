import tabula
from typing import List
import pandas as pd


class ParseVerificationStatementService:
    @staticmethod
    def read_tables(file_path: str) -> List[pd.DataFrame]:
        # Use tabula to extract tables from the PDF
        return tabula.read_pdf(file_path, stream=True, pages="all")
    
    @staticmethod
    def search_table_headers_for_keywords(tables: list[pd.DataFrame]):
        """
        Best-guess attempt at determining which tables are the most relevant. 
        This is done by searching for keywords in the table headers, such as "Error" or "Opinion".

        Tables with "Opinion" in the column headers are assumed to relate to verifier's determination
        of Unmodified/Modified/Adverse (1 for emissions sections, 1 for compliance section if the operation is Regulated.)

        Tables with "Error" in the column headers are assumed to list the errors the verifier found,
        including whether those errors were Material or Immaterial.

        If a table contains any of these keywords in its headers, it is considered a key table and is returned in the list of key tables.
        """
        key_tables = []
        for table in tables:
            headers = table.columns.astype(str)
            if headers.str.contains("Error|Opinion", regex=True, na=False).any():
                key_tables.append(table)
        return key_tables
