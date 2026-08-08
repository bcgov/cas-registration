from datetime import date

# RegulatedProduct.valid_from/valid_to are NOT NULL. They are seeded with the baseline validity
# window here and given their final values by populate_valid_dates in migration 0002.
DEFAULT_VALID_FROM = date(2023, 1, 1)
DEFAULT_VALID_TO = date(2099, 12, 31)


def _with_default_validity(products):
    for product in products:
        product.valid_from = DEFAULT_VALID_FROM
        product.valid_to = DEFAULT_VALID_TO
    return products


def init_app_role_data(apps, schema_editor):
    AppRole = apps.get_model('registration', 'AppRole')
    AppRole.objects.bulk_create(
        [
            AppRole(
                role_name='cas_admin',
                role_description='Admin user from the BC Government. Highest government user privilege.',
            ),
            AppRole(
                role_name='cas_analyst',
                role_description='Analyst user from the BC Government. Lower access privileges than cas_admin.',
            ),
            AppRole(
                role_name='cas_pending',
                role_description='Pending BC Government user. Requires access to be granted by an admin before having any privileges.',
            ),
            AppRole(
                role_name='industry_user',
                role_description='External user from industry. All industry_users have the same initial privileges. Their privileges for individual operators are further defined and applied in the user_operator through table.',
            ),
            AppRole(
                role_name='cas_director',
                role_description='Director user from the BC Government.',
            ),
            AppRole(
                role_name='cas_view_only',
                role_description='User from the BC Government that only had readonly access to the app.',
            ),
        ]
    )


def reverse_init_app_role_data(apps, schema_editor):
    AppRole = apps.get_model('registration', 'AppRole')
    AppRole.objects.filter(
        role_name__in=['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user', 'cas_director', 'cas_view_only']
    ).delete()


def init_business_role_data(apps, schema_editor):
    BusinessRole = apps.get_model('registration', 'BusinessRole')
    BusinessRole.objects.bulk_create(
        [
            BusinessRole(
                role_name='Senior Officer',
                role_description='A person who has the authority to make decisions on behalf of the business.',
            ),
            BusinessRole(
                role_name='Operation Representative',
                role_description='A person who is responsible for the day-to-day operations of the business.',
            ),
            BusinessRole(
                role_name='Authorized Signing Officer',
                role_description='A person who has the authority to sign documents on behalf of the business.',
            ),
        ]
    )


def reverse_init_business_role_data(apps, schema_editor):
    BusinessRole = apps.get_model('registration', 'BusinessRole')
    BusinessRole.objects.filter(
        role_name__in=[
            'Senior Officer',
            'Operation Representative',
            'Authorized Signing Officer',
            'Operation Registration Lead',
        ]
    ).delete()


def init_business_structure_data(apps, schema_editor):
    BusinessStructure = apps.get_model('registration', 'BusinessStructure')
    BusinessStructure.objects.bulk_create(
        [
            BusinessStructure(name='General Partnership'),
            BusinessStructure(name='BC Corporation'),
            BusinessStructure(name='Extra Provincially Registered Company'),
            BusinessStructure(name='Sole Proprietorship'),
            BusinessStructure(name='Limited Liability Partnership'),
            BusinessStructure(name='BC Incorporated Society'),
            BusinessStructure(name='Extraprovincial Non-Share Corporation'),
        ]
    )


def reverse_init_business_structure_data(apps, schema_editor):
    BusinessStructure = apps.get_model('registration', 'BusinessStructure')
    BusinessStructure.objects.filter(
        name__in=[
            'General Partnership',
            'BC Corporation',
            'Extra Provincially Registered Company',
            'Sole Proprietorship',
            'Limited Liability Partnership',
            'BC Incorporated Society',
            'Extraprovincial Non-Share Corporation',
        ]
    ).delete()


def init_document_type_data(apps, schema_editor):
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.bulk_create(
        [
            DocumentType(name='new_entrant_application'),
            DocumentType(name='boundary_map'),
            DocumentType(name='signed_statutory_declaration'),
            DocumentType(name='process_flow_diagram'),
            DocumentType(name='proof_of_authority_of_partner_company'),
            DocumentType(name='senior_officer_proof_of_authority'),
            DocumentType(name='operation_representative_proof_of_authority'),
            DocumentType(name='soce_senior_officer_proof_of_authority'),
            DocumentType(name='proof_of_start'),
            DocumentType(name='opt_in_signed_statutory_declaration'),
            DocumentType(name='equipment_list'),
        ]
    )


def reverse_init_document_type_data(apps, schema_editor):
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.filter(
        name__in=[
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
    ).delete()


def init_naics_code_data(apps, schema_editor):
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsCode.objects.bulk_create(
        [
            NaicsCode(
                naics_code='211110', naics_description='Oil and gas extraction (except oil sands)', is_regulated=True
            ),
            NaicsCode(naics_code='212114', naics_description='Bituminous coal mining', is_regulated=True),
            NaicsCode(naics_code='212220', naics_description='Gold and silver ore mining', is_regulated=True),
            NaicsCode(naics_code='212231', naics_description='Lead-zinc ore mining', is_regulated=True),
            NaicsCode(naics_code='212233', naics_description='Copper-zinc ore mining', is_regulated=True),
            NaicsCode(naics_code='212299', naics_description='All other metal ore mining', is_regulated=True),
            NaicsCode(naics_code='213118', naics_description='Services to oil and gas extraction', is_regulated=True),
            NaicsCode(naics_code='311119', naics_description='Other animal food manufacturing', is_regulated=True),
            NaicsCode(naics_code='311310', naics_description='Sugar manufacturing', is_regulated=True),
            NaicsCode(
                naics_code='311614', naics_description='Rendering and meat processing from carcasses', is_regulated=True
            ),
            NaicsCode(
                naics_code='321111', naics_description='Sawmills (except shingle and shake mills)', is_regulated=True
            ),
            NaicsCode(naics_code='321212', naics_description='Softwood veneer and plywood mills', is_regulated=True),
            NaicsCode(naics_code='321216', naics_description='Particle board and fibreboard mills', is_regulated=True),
            NaicsCode(
                naics_code='321999',
                naics_description='All other miscellaneous wood product manufacturing',
                is_regulated=True,
            ),
            NaicsCode(naics_code='322111', naics_description='Mechanical pulp mills', is_regulated=True),
            NaicsCode(naics_code='322112', naics_description='Chemical pulp mills', is_regulated=True),
            NaicsCode(naics_code='322121', naics_description='Paper (except newsprint) mills', is_regulated=True),
            NaicsCode(naics_code='322122', naics_description='Newsprint mills', is_regulated=True),
            NaicsCode(naics_code='324110', naics_description='Petroleum refineries', is_regulated=True),
            NaicsCode(naics_code='325120', naics_description='Industrial gas manufacturing', is_regulated=True),
            NaicsCode(naics_code='325181', naics_description='Alkali and chlorine manufacturing', is_regulated=True),
            NaicsCode(
                naics_code='325189',
                naics_description='All other basic inorganic chemical manufacturing',
                is_regulated=True,
            ),
            NaicsCode(naics_code='327310', naics_description='Cement manufacturing', is_regulated=True),
            NaicsCode(naics_code='327410', naics_description='Lime manufacturing', is_regulated=True),
            NaicsCode(naics_code='327420', naics_description='Gypsum product manufacturing', is_regulated=True),
            NaicsCode(
                naics_code='327990',
                naics_description='All other non-metallic mineral product manufacturing',
                is_regulated=True,
            ),
            NaicsCode(naics_code='331222', naics_description='Steel wire drawing', is_regulated=True),
            NaicsCode(
                naics_code='331313', naics_description='Primary production of alumina and aluminum', is_regulated=True
            ),
            NaicsCode(
                naics_code='331410',
                naics_description='Non-ferrous metal (except aluminum) smelting and refining',
                is_regulated=True,
            ),
            NaicsCode(naics_code='331511', naics_description='Iron foundries', is_regulated=True),
            NaicsCode(
                naics_code='412110',
                naics_description='Petroleum, petroleum products, and other hydrocarbons merchant wholesalers',
                is_regulated=True,
            ),
            NaicsCode(
                naics_code='486210', naics_description='Pipeline transportation of natural gas', is_regulated=True
            ),
            NaicsCode(
                naics_code='325190', naics_description='Other basic organic chemical manufacturing', is_regulated=True
            ),
            NaicsCode(naics_code='111412', naics_description='Cannabis grown under cover', is_regulated=False),
            NaicsCode(naics_code='111419', naics_description='Other food crops grown under cover', is_regulated=False),
            NaicsCode(naics_code='221111', naics_description='Hydro-electric power generation', is_regulated=False),
            NaicsCode(
                naics_code='221112', naics_description='Fossil-fuel electric power generation', is_regulated=False
            ),
            NaicsCode(naics_code='221119', naics_description='Other electric power generation', is_regulated=False),
            NaicsCode(
                naics_code='221121',
                naics_description='Electric bulk power transmission and control',
                is_regulated=False,
            ),
            NaicsCode(naics_code='221210', naics_description='Natural gas distribution', is_regulated=False),
            NaicsCode(naics_code='221320', naics_description='Sewage treatment facilities', is_regulated=False),
            NaicsCode(naics_code='221330', naics_description='Steam and air-conditioning supply', is_regulated=False),
            NaicsCode(
                naics_code='486110', naics_description='Pipeline transportation of crude oil', is_regulated=False
            ),
            NaicsCode(naics_code='493110', naics_description='General warehousing and storage', is_regulated=False),
            NaicsCode(naics_code='493190', naics_description='Other warehousing and storage', is_regulated=False),
            NaicsCode(naics_code='562210', naics_description='Waste treatment and disposal', is_regulated=False),
            NaicsCode(
                naics_code='811199',
                naics_description='All other automotive repair and maintenance',
                is_regulated=False,
            ),
        ]
    )


def reverse_init_naics_code_data(apps, schema_editor):
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsCode.objects.filter(
        naics_code__in=[
            '211110',
            '212114',
            '212220',
            '212231',
            '212233',
            '212299',
            '213118',
            '311119',
            '311310',
            '311614',
            '321111',
            '321212',
            '321216',
            '321999',
            '322111',
            '322112',
            '322121',
            '322122',
            '324110',
            '325120',
            '325181',
            '325189',
            '327310',
            '327410',
            '327420',
            '327990',
            '331222',
            '331313',
            '331410',
            '331511',
            '412110',
            '486210',
            '325190',
            '111412',
            '111419',
            '221111',
            '221112',
            '221119',
            '221121',
            '221210',
            '221320',
            '221330',
            '486110',
            '493110',
            '493190',
            '562210',
            '811199',
        ]
    ).delete()


def init_regulated_product_data(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    RegulatedProduct.objects.bulk_create(
        _with_default_validity(
            [
                RegulatedProduct(name='BC-specific refinery complexity throughput', unit='BCRCT', is_regulated=True),
                RegulatedProduct(name='Cement equivalent', unit='Tonne cement equivalent', is_regulated=True),
                RegulatedProduct(
                    name='Chemicals: pure hydrogen peroxide', unit='Tonne pure hydrogen peroxide', is_regulated=True
                ),
                RegulatedProduct(
                    name='Compression, centrifugal - consumed energy', unit='MWh consumed energy', is_regulated=True
                ),
                RegulatedProduct(
                    name='Compression, positive displacement - consumed energy',
                    unit='MWh consumed energy',
                    is_regulated=True,
                ),
                RegulatedProduct(name='Gypsum wallboard', unit='Thousand square feet', is_regulated=True),
                RegulatedProduct(
                    name='Lime at 94.5% CaO and lime kiln dust', unit='Tonne lime@94.5% CAO + LKD', is_regulated=True
                ),
                RegulatedProduct(name='Limestone for sale', unit='Tonne limestone', is_regulated=True),
                RegulatedProduct(name='Liquefied natural gas', unit='N/A', is_regulated=True),
                RegulatedProduct(name='Mining: coal', unit='Tonne saleable coal', is_regulated=True),
                RegulatedProduct(
                    name='Mining: copper-equivalent, open pit', unit='Tonne copper-equivalent', is_regulated=True
                ),
                RegulatedProduct(
                    name='Mining: copper-equivalent, underground', unit='Tonne copper-equivalent', is_regulated=True
                ),
                RegulatedProduct(name='Mining: gold-equivalent', unit='Tonne gold-equivalent', is_regulated=True),
                RegulatedProduct(
                    name='Processing sour gas - oil equivalent', unit='Cubic metre oil-equivalent', is_regulated=True
                ),
                RegulatedProduct(
                    name='Processing sweet gas - oil equivalent', unit='Cubic metre oil-equivalent', is_regulated=True
                ),
                RegulatedProduct(
                    name='Pulp and paper: chemical pulp', unit='Tonne saleable dry chemical pulp', is_regulated=True
                ),
                RegulatedProduct(
                    name='Pulp and paper: non-chemical pulp',
                    unit='Tonne saleable dry non-chemical pulp',
                    is_regulated=True,
                ),
                RegulatedProduct(
                    name='Pulp and paper: paper (except newsprint and tissue paper)',
                    unit='Tonne saleable paper',
                    is_regulated=True,
                ),
                RegulatedProduct(
                    name='Pulp and paper: tissue Paper', unit='Tonne saleable tissue paper', is_regulated=True
                ),
                RegulatedProduct(
                    name='Rendering and meat processing: protein and fat',
                    unit='Tonne protein and fat',
                    is_regulated=True,
                ),
                RegulatedProduct(name='Renewable diesel', unit='N/A', is_regulated=True),
                RegulatedProduct(name='Smelting: aluminum', unit='Tonne saleable aluminum', is_regulated=True),
                RegulatedProduct(name='Smelting: lead-zinc', unit='Tonne lead-zinc', is_regulated=True),
                RegulatedProduct(name='Sold electricity', unit='GWh', is_regulated=True),
                RegulatedProduct(name='Sold Heat', unit='GJ', is_regulated=True),
                RegulatedProduct(
                    name='Steel wire: HDG-process (hot dip galvanization)',
                    unit='Tonne hot dip galvanization wire',
                    is_regulated=True,
                ),
                RegulatedProduct(name='Steel wire: Non-HDG', unit='Tonne non-HDG wire', is_regulated=True),
                RegulatedProduct(name='Sugar: liquid', unit='Tonne solid sugar content', is_regulated=True),
                RegulatedProduct(name='Sugar: solid', unit='Tonne solid sugar', is_regulated=True),
                RegulatedProduct(name='Wood products: lumber', unit='Cubic metre saleable lumber', is_regulated=True),
                RegulatedProduct(
                    name='Wood products: medium density fibreboard (MDF)',
                    unit='Cubic metre saleable MDF',
                    is_regulated=True,
                ),
                RegulatedProduct(name='Wood products: plywood', unit='Cubic metre saleable plywood', is_regulated=True),
                RegulatedProduct(name='Wood products: veneer', unit='Cubic metre saleable veneer', is_regulated=True),
                RegulatedProduct(
                    name='Wood products: wood chips (including hog fuel)',
                    unit='Cubic metre saleable wood chips',
                    is_regulated=True,
                ),
                RegulatedProduct(
                    name='Wood products: wood pellets', unit='Tonne saleable wood pellets', is_regulated=True
                ),
                RegulatedProduct(
                    name='Forged steel balls: less than 3.5 inches diameter',
                    unit='Tonne forged steel balls',
                    is_regulated=True,
                ),
                RegulatedProduct(
                    name='Forged steel balls: greater than 4 inches diameter',
                    unit='Tonne forged steel balls',
                    is_regulated=True,
                ),
            ]
        )
    )


def reverse_init_regulated_product_data(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    RegulatedProduct.objects.filter(
        name__in=[
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
        ]
    ).delete()


def init_activity_data(apps, schema_editor):
    Activity = apps.get_model('registration', 'Activity')
    Activity.objects.bulk_create(
        [
            Activity(
                name='General stationary combustion excluding line tracing',
                applicable_to='all',
                slug='gsc_excluding_line_tracing',
                weight=100,
            ),
            Activity(
                name='General stationary combustion solely for the purpose of line tracing',
                applicable_to='all',
                slug='gsc_solely_for_line_tracing',
                weight=200,
            ),
            Activity(
                name='Fuel combustion by mobile equipment',
                applicable_to='Single Facility Operation',
                slug='fuel_combustion_by_mobile',
                weight=500,
            ),
            Activity(
                name='Aluminum or alumina production', applicable_to='all', slug='aluminum_production', weight=9999
            ),
            Activity(name='Ammonia production', applicable_to='all', slug='ammonia_production', weight=9999),
            Activity(name='Cement production', applicable_to='all', slug='cement_production', weight=9999),
            Activity(name='Underground coal mining', applicable_to='all', slug='underground_coal_mining', weight=9999),
            Activity(
                name='Coal storage at facilities that combust coal',
                applicable_to='all',
                slug='coal_storage',
                weight=9999,
            ),
            Activity(
                name='Copper or nickel smelting or refining',
                applicable_to='all',
                slug='copper_nickel_refining',
                weight=9999,
            ),
            Activity(name='Electricity generation', applicable_to='all', slug='electricity_generation', weight=9999),
            Activity(
                name='Electronics manufacturing', applicable_to='all', slug='electronics_manufacturing', weight=9999
            ),
            Activity(name='Ferroalloy production', applicable_to='all', slug='ferroalloy_production', weight=9999),
            Activity(name='Glass manufacturing', applicable_to='all', slug='glass_manufacturing', weight=9999),
            Activity(name='Hydrogen production', applicable_to='all', slug='hydrogen_production', weight=9999),
            Activity(
                name='Industrial wastewater processing',
                applicable_to='all',
                slug='ind_wastewater_processing',
                weight=9999,
            ),
            Activity(name='Lead production', applicable_to='all', slug='lead_production', weight=9999),
            Activity(name='Lime manufacturing', applicable_to='all', slug='lime_manufacturing', weight=9999),
            Activity(name='Magnesium production', applicable_to='all', slug='magnesium_production', weight=9999),
            Activity(
                name='Nitric acid manufacturing', applicable_to='all', slug='nitric_acid_manufacturing', weight=9999
            ),
            Activity(
                name='Petrochemical production', applicable_to='all', slug='petrochemical_production', weight=9999
            ),
            Activity(name='Petroleum refining', applicable_to='all', slug='petroleum_refining', weight=9999),
            Activity(name='Phosphoric acid production', applicable_to='all', slug='phos_acid_production', weight=9999),
            Activity(name='Pulp and paper production', applicable_to='all', slug='pulp_and_paper', weight=9999),
            Activity(name='Refinery fuel gas combustion', applicable_to='all', slug='refinery_fuel_gas', weight=9999),
            Activity(name='Zinc production', applicable_to='all', slug='zinc_production', weight=9999),
            Activity(name='Open pit coal mining', applicable_to='all', slug='open_pit_coal_mining', weight=9999),
            Activity(
                name='Storage of petroleum products', applicable_to='all', slug='storage_petro_products', weight=9999
            ),
            Activity(name='Carbonate use', applicable_to='all', slug='carbonate_use', weight=9999),
            Activity(
                name='General stationary combustion, other than non-compression and non-processing combustion',
                applicable_to='Linear Facilities Operation',
                slug='gsc_other_than_non_compression',
                weight=300,
            ),
            Activity(
                name='General stationary non-compression and non-processing combustion',
                applicable_to='Linear Facilities Operation',
                slug='gsc_non_compression',
                weight=400,
            ),
            Activity(
                name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                applicable_to='Linear Facilities Operation',
                slug='og_activities_other_than_non_compression',
                weight=9999,
            ),
            Activity(
                name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                applicable_to='Linear Facilities Operation',
                slug='og_activities_non_compression',
                weight=9999,
            ),
            Activity(
                name='Electricity transmission',
                applicable_to='Linear Facilities Operation',
                slug='electricity_transmission',
                weight=9999,
            ),
            Activity(
                name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                applicable_to='Linear Facilities Operation',
                slug='natural_gas_activities_other_than_non_compression',
                weight=9999,
            ),
            Activity(
                name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                applicable_to='Linear Facilities Operation',
                slug='natural_gas_activities_non_compression',
                weight=9999,
            ),
            Activity(
                name='LNG activities', applicable_to='Linear Facilities Operation', slug='lng_activities', weight=9999
            ),
        ]
    )


def reverse_init_activity_data(apps, schema_editor):
    Activity = apps.get_model('registration', 'Activity')
    Activity.objects.all().delete()


def populate_facility_lat_long(apps, schema_editor):
    Facility = apps.get_model('registration', 'Facility')
    Facility.objects.update(latitude_of_largest_emissions=0, longitude_of_largest_emissions=0)


def add_unregulated_products(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')

    RegulatedProduct.objects.create(
        name='Oil and gas non-processing, non-compression',
        unit='N/A',
        is_regulated=False,
        valid_from=DEFAULT_VALID_FROM,
        valid_to=DEFAULT_VALID_TO,
    )
    RegulatedProduct.objects.create(
        name='Fat, oil and grease collection, refining and storage',
        unit='N/A',
        is_regulated=False,
        valid_from=DEFAULT_VALID_FROM,
        valid_to=DEFAULT_VALID_TO,
    )
    RegulatedProduct.objects.create(
        name='Refineries line tracing',
        is_regulated=False,
        valid_from=DEFAULT_VALID_FROM,
        valid_to=DEFAULT_VALID_TO,
    )


def reverse_add_unregulated_products(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')

    RegulatedProduct.objects.filter(
        name='Oil and gas non-processing, non-compression',
    ).delete()
    RegulatedProduct.objects.filter(
        name='Fat, oil and grease collection, refining and storage',
    ).delete()
    RegulatedProduct.objects.filter(
        name='Refineries line tracing',
    ).delete()
