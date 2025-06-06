from django.test import TestCase
from registration.models import (
    BusinessRole,
    BusinessStructure,
    DocumentType,
    NaicsCode,
    Activity,
    RegulatedProduct,
    AppRole,
)


class TestInitialData(TestCase):
    def test_app_role_initial_data(self):
        expected_roles = sorted(
            ['cas_admin', 'cas_analyst', 'cas_pending', 'cas_director', 'cas_view_only', 'industry_user']
        )
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_business_role_initial_data(self):
        expected_roles = sorted(['Senior Officer', 'Operation Representative', 'Authorized Signing Officer'])
        existing_roles = sorted(list(BusinessRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_business_structure_initial_data(self):
        expected_structures = sorted(
            [
                'General Partnership',
                'BC Corporation',
                'Extra Provincially Registered Company',
                'Sole Proprietorship',
                'Limited Liability Partnership',
                'BC Incorporated Society',
                'Extraprovincial Non-Share Corporation',
            ]
        )
        existing_structures = sorted(list(BusinessStructure.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_structures), len(expected_structures))
        self.assertEqual(existing_structures, expected_structures)

    def test_document_type_initial_data(self):
        expected_types = sorted(
            [
                'boundary_map',
                'signed_statutory_declaration',
                'process_flow_diagram',
                'proof_of_authority_of_partner_company',
                'senior_officer_proof_of_authority',
                'operation_representative_proof_of_authority',
                'soce_senior_officer_proof_of_authority',
                'proof_of_start',
                'opt_in_signed_statutory_declaration',
                'equipment_list',
                'new_entrant_application',
            ]
        )
        existing_types = sorted(list(DocumentType.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_types), len(expected_types))
        self.assertEqual(existing_types, expected_types)

    def test_naics_code_initial_data(self):
        expected_codes = sorted(
            [
                ('211110', 'Oil and gas extraction (except oil sands)', True),
                ('212114', 'Bituminous coal mining', True),
                ('212220', 'Gold and silver ore mining', True),
                ('212231', 'Lead-zinc ore mining', True),
                ('212233', 'Copper-zinc ore mining', True),
                ('212299', 'All other metal ore mining', True),
                ('213118', 'Services to oil and gas extraction', True),
                ('311119', 'Other animal food manufacturing', True),
                ('311310', 'Sugar manufacturing', True),
                ('311614', 'Rendering and meat processing from carcasses', True),
                ('321111', 'Sawmills (except shingle and shake mills)', True),
                ('321212', 'Softwood veneer and plywood mills', True),
                ('321216', 'Particle board and fibreboard mills', True),
                ('321999', 'All other miscellaneous wood product manufacturing', True),
                ('322111', 'Mechanical pulp mills', True),
                ('322112', 'Chemical pulp mills', True),
                ('322121', 'Paper (except newsprint) mills', True),
                ('322122', 'Newsprint mills', True),
                ('324110', 'Petroleum refineries', True),
                ('325120', 'Industrial gas manufacturing', True),
                ('325181', 'Alkali and chlorine manufacturing', True),
                ('325189', 'All other basic inorganic chemical manufacturing', True),
                ('325190', 'Other basic organic chemical manufacturing', True),
                ('327310', 'Cement manufacturing', True),
                ('327410', 'Lime manufacturing', True),
                ('327420', 'Gypsum product manufacturing', True),
                ('327990', 'All other non-metallic mineral product manufacturing', True),
                ('331222', 'Steel wire drawing', True),
                ('331313', 'Primary production of alumina and aluminum', True),
                ('331410', 'Non-ferrous metal (except aluminum) smelting and refining', True),
                ('331511', 'Iron foundries', True),
                ('412110', 'Petroleum, petroleum products, and other hydrocarbons merchant wholesalers', True),
                ('486210', 'Pipeline transportation of natural gas', True),
                ('111412', 'Cannabis grown under cover', False),
                ('111419', 'Other food crops grown under cover', False),
                ('221111', 'Hydro-electric power generation', False),
                ('221112', 'Fossil-fuel electric power generation', False),
                ('221119', 'Other electric power generation', False),
                (
                    '221121',
                    'Electric bulk power transmission and control',
                    False,
                ),
                ('221210', 'Natural gas distribution', False),
                ('221320', 'Sewage treatment facilities', False),
                ('221330', 'Steam and air-conditioning supply', False),
                ('486110', 'Pipeline transportation of crude oil', False),
                ('493110', 'General warehousing and storage', False),
                ('493190', 'Other warehousing and storage', False),
                ('562210', 'Waste treatment and disposal', False),
                ('811199', 'All other automotive repair and maintenance', False),
            ]
        )
        existing_codes = sorted(list(NaicsCode.objects.values_list('naics_code', 'naics_description', 'is_regulated')))
        self.assertEqual(len(existing_codes), len(expected_codes))
        self.assertEqual(existing_codes, expected_codes)

    def test_regulated_product_initial_data(self):
        expected_products = sorted(
            [
                'BC-specific refinery complexity throughput',
                'Cement equivalent',
                'Chemicals: pure hydrogen peroxide',
                'Compression, centrifugal - consumed energy',
                'Compression, positive displacement - consumed energy',
                'Gypsum wallboard',
                'Lime at 94.5% CaO and lime kiln dust',
                'Limestone for sale',
                'Liquefied natural gas',
                'Mining: coal',
                'Mining: copper-equivalent, open pit',
                'Mining: copper-equivalent, underground',
                'Mining: gold-equivalent',
                'Processing sour gas - oil equivalent',
                'Processing sweet gas - oil equivalent',
                'Pulp and paper: chemical pulp',
                'Pulp and paper: non-chemical pulp',
                'Pulp and paper: paper (except newsprint and tissue paper)',
                'Pulp and paper: tissue Paper',
                'Rendering and meat processing: protein and fat',
                'Renewable diesel',
                'Smelting: aluminum',
                'Smelting: lead-zinc',
                'Sold electricity',
                'Sold Heat',
                'Steel wire: HDG-process (hot dip galvanization)',
                'Steel wire: Non-HDG',
                'Sugar: liquid',
                'Sugar: solid',
                'Wood products: lumber',
                'Wood products: medium density fibreboard (MDF)',
                'Wood products: plywood',
                'Wood products: veneer',
                'Wood products: wood chips (including hog fuel)',
                'Wood products: wood pellets',
                'Forged steel balls: less than 3.5 inches diameter',
                'Forged steel balls: greater than 4 inches diameter',
                'Oil and gas non-processing, non-compression',
                'Fat, oil and grease collection, refining and storage',
                'Refineries line tracing',
            ]
        )
        existing_products = sorted(list(RegulatedProduct.objects.values_list('name', flat=True)))
        self.assertEqual(len(existing_products), len(expected_products))
        self.assertEqual(existing_products, expected_products)

    def test_activity_initial_data(self):
        expected_activities = sorted(
            [
                ('General stationary combustion excluding line tracing', 'sfo'),
                ('General stationary combustion solely for the purpose of line tracing', 'sfo'),
                ('Fuel combustion by mobile equipment', 'sfo'),
                ('Aluminum or alumina production', 'sfo'),
                ('Ammonia production', 'sfo'),
                ('Cement production', 'sfo'),
                ('Underground coal mining', 'sfo'),
                ('Coal storage at facilities that combust coal', 'sfo'),
                ('Copper or nickel smelting or refining', 'sfo'),
                ('Electricity generation', 'sfo'),
                ('Electronics manufacturing', 'sfo'),
                ('Ferroalloy production', 'sfo'),
                ('Glass manufacturing', 'sfo'),
                ('Hydrogen production', 'sfo'),
                ('Industrial wastewater processing', 'sfo'),
                ('Lead production', 'sfo'),
                ('Lime manufacturing', 'sfo'),
                ('Magnesium production', 'sfo'),
                ('Nitric acid manufacturing', 'sfo'),
                ('Petrochemical production', 'sfo'),
                ('Petroleum refining', 'sfo'),
                ('Phosphoric acid production', 'sfo'),
                ('Pulp and paper production', 'sfo'),
                ('Refinery fuel gas combustion', 'sfo'),
                ('Zinc production', 'sfo'),
                ('Open pit coal mining', 'sfo'),
                ('Storage of petroleum products', 'sfo'),
                ('Carbonate use', 'sfo'),
                ('General stationary combustion, other than non-compression and non-processing combustion', 'lfo'),
                ('General stationary non-compression and non-processing combustion', 'lfo'),
                ('Electricity transmission', 'lfo'),
                (
                    'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                    'lfo',
                ),
                (
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'lfo',
                ),
                (
                    'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                    'lfo',
                ),
                (
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                    'lfo',
                ),
                ('LNG activities', 'lfo'),
            ]
        )
        existing_activities = sorted(list(Activity.objects.values_list('name', 'applicable_to')))
        self.assertEqual(len(existing_activities), len(expected_activities))
        self.assertEqual(existing_activities, expected_activities)
