# Generated by Django 5.0.6 on 2024-07-02 21:15

from django.db import migrations


def init_configuration_data(apps, schema_monitor):
    '''
    Add initial data to erc.configuration
    '''

    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.bulk_create([Configuration(slug='2024', valid_from='2024-01-01', valid_to='2099-12-31')])


def reverse_init_configuration_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.filter(slug__in=['2024']).delete()


def init_source_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.sourcetype
    '''
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.bulk_create(
        [
            SourceType(
                name='General stationary combustion of fuel or waste with production of useful energy',
                json_key='gscWithProductionOfUsefulEnergy',
            ),
            SourceType(
                name='General stationary combustion of waste without production of useful energy',
                json_key='gscWithoutProductionOfUsefulEnergy',
            ),
            SourceType(
                name='Fuel combustion by mobile equipment that is part of the facility',
                json_key='mobileFuelCombustionPartOfFacility',
            ),
            SourceType(
                name='Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
                json_key='anodeCathodeBackingGreenCokeCalcination',
            ),
            SourceType(name='Anode effects', json_key='anodeEffects'),
            SourceType(name='Cover gas from electrolysis cells', json_key='coverGasFromElectrolysisCells'),
            SourceType(
                name='Steam reformation or gasification of a hydrocarbon during ammonia production',
                json_key='steamReformationOrGasificiation',
            ),
            SourceType(
                name='Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
                json_key='calcinationUsedToProductClinker',
            ),
            SourceType(
                name='Coal when broken or exposed to the atmosphere during mining', json_key='coalExposedDuringMining'
            ),
            SourceType(name='Stored coal piles', json_key='storedCoalPiles'),
            SourceType(
                name='Removal of impurities using carbonate flux reagents',
                json_key='removalOfImpuritiesUsingCarbonateFluxReagents',
            ),
            SourceType(name='Use of reducing agents', json_key='useOfReducingAgents'),
            SourceType(
                name='Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes',
                json_key='slagCleaningandConsumptionOfGraphite',
            ),
            SourceType(
                name='The solvent extraction and electrowinning process, also known as SX-EW',
                json_key='solventExtractionElectrowinningProcess',
            ),
            SourceType(
                name='Fuel combustion for electricity generation', json_key='fuelCombustionForElectricityGeneration'
            ),
            SourceType(name='Acid gas scrubbers and acid gas reagents', json_key='acidgasScrubbersAndReagents'),
            SourceType(name='Cooling units', json_key='coolingUnits'),
            SourceType(name='Geothermal geyser steam or fluids', json_key='geothermalGeyserSteamOrFluids'),
            SourceType(
                name='Installation, maintenance, operation and decommissioning of electrical equipment',
                json_key='installationMaintOperationOfElectricalEquipment',
            ),
            SourceType(
                name='Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes',
                json_key='electronicsManufacturingChemicalVapourDeposition',
            ),
            SourceType(
                name='Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production',
                json_key='removalOfImpuritiesDuringFerroalloyProduction',
            ),
            SourceType(name='Calcination of carbonate materials', json_key='calcinationOfCarbonateMaterials'),
            SourceType(
                name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
                json_key='otherTransformationOfHydrocarbonFeedstock',
            ),
            SourceType(
                name='Industrial wastewater process using anaerobic digestion',
                json_key='industrialWastewaterProcessAnaerobicDigestion',
            ),
            SourceType(name='Oil-water separators', json_key='oilWaterSeparators'),
            SourceType(
                name='Use of reducing agents during lead production', json_key='useOfReducingAgentsDuringLeadProduction'
            ),
            SourceType(
                name='Calcination of carbonate materials in lime manufacturing',
                json_key='calcinationOfCarbonateMaterialsLimeProduction',
            ),
            SourceType(
                name='Use of reducing agents in magnesium production', json_key='reducingAgentsMagnesiumProduction'
            ),
            SourceType(
                name='Cover gases or carrier gases in magnesium production',
                json_key='coverCarrierGasesMagnesiumProduction',
            ),
            SourceType(
                name='Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing',
                json_key='oxidationCondensationAbsorptionNitricAcidManufacturing',
            ),
            SourceType(name='Flares and oxidizers', json_key='flaresAndOxidizers'),
            SourceType(name='Process vents', json_key='processVents'),
            SourceType(name='Equipment leaks', json_key='equipmentLeaks'),
            SourceType(name='Ethylene production', json_key='ethyleneProduction'),
            SourceType(name='Process units', json_key='processUnits'),
            SourceType(name='Catalyst regeneration', json_key='catalystRegeneration'),
            SourceType(name='Asphalt production', json_key='asphaltProduction'),
            SourceType(name='Sulphur recovery', json_key='sulphurRecovery'),
            SourceType(
                name='Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
                json_key='flaresCombustionOfPurgeGas',
            ),
            SourceType(name='Above-ground storage tanks at refineries', json_key='aboveGroundStorageTanksAtRefineries'),
            SourceType(name='Oil-water separators at refineries', json_key='oilWaterSeparatorsAtRefineries'),
            SourceType(name='Equipment leaks at refineries', json_key='equipmentLeaksAtRefineries'),
            SourceType(
                name='Wastewater processing using anaerobic digestion at refineries',
                json_key='wastewaterProcessingAnaerobicDigestionAtRefineries',
            ),
            SourceType(
                name='Uncontrolled blowdown systems used at refineries',
                json_key='uncontrolledBlowdownSystemsAtRefineries',
            ),
            SourceType(
                name='Loading operations at refineries and terminals',
                json_key='loadingOperationsatRefineriesAndTerminals',
            ),
            SourceType(name='Delayed coking units at refineries', json_key='delayedCokingAtRefineries'),
            SourceType(name='Coke calcining at refineries', json_key='cokeCalciningAtRefineries'),
            SourceType(
                name='Reaction of calcium carbonate with sulphuric acid',
                json_key='reactionCalciumCarbonateWithSulphuricAcid',
            ),
            SourceType(name='Pulping and chemical recovery', json_key='pulpingAndChemicalRecovery'),
            SourceType(
                name='Combustion of refinery fuel gas, still gas, flexigas or associated gas',
                json_key='combustionRefineryFuelGasStillGasFlexigas',
            ),
            SourceType(
                name='Use of reducing agents during zinc production', json_key='reducingAgentsDuringZincProduction'
            ),
            SourceType(name='Above-ground storage tanks', json_key='aboveGroundStorageTanks'),
            SourceType(
                name='Carbonates used but not consumed in other activities set out in column 2',
                json_key='carbonatesNotConsumedInActivitesColumnTwo',
            ),
            SourceType(
                name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                json_key='gscFuelOrWasteLinearFacilitiesUsefulEnergy',
            ),
            SourceType(
                name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                json_key='gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy',
            ),
            SourceType(
                name='Field gas or process vent gas combustion at a linear facilities operation',
                json_key='fieldProcessVentGasLinearFacilities',
            ),
            SourceType(
                name='Natural gas pneumatic high bleed device venting',
                json_key='naturalGasPneumatciHighBleedDeviceVenting',
            ),
            SourceType(name='Natural gas pneumatic pump venting', json_key='naturalGasPneumaticPumpVenting'),
            SourceType(
                name='Natural gas pneumatic low bleed device venting',
                json_key='naturalGasPneumaticLowBleedDeviceVenting',
            ),
            SourceType(
                name='Natural gas pneumatic intermittent bleed device venting',
                json_key='naturalGasPneumaticIntermittentBleedDeviceVenting',
            ),
            SourceType(name='Acid gas removal venting or incineration', json_key='acidGasRemovalVentingOrIncineration'),
            SourceType(name='Dehydrator venting', json_key='dehydratorVenting'),
            SourceType(name='Blowdown venting', json_key='blowdownVenting'),
            SourceType(
                name='Releases from tanks used for storage, production or processing',
                json_key='releasesFromTanksUsedForStorageProductionProcessing',
            ),
            SourceType(name='Associated gas venting', json_key='associatedGasVenting'),
            SourceType(name='Associated gas flaring', json_key='associatedGasFlaring'),
            SourceType(name='Flaring stacks', json_key='flaringStacks'),
            SourceType(name='Centrifugal compressor venting', json_key='centrifugalCompressorVenting'),
            SourceType(name='Reciprocating compressor venting', json_key='reciprocatingCompressorVenting'),
            SourceType(
                name='Equipment leaks detected using leak detection and leaker emission factor methods',
                json_key='equipmentLeaksDetectedLearkerEmissionFactorMethods',
            ),
            SourceType(name='Population count sources', json_key='populationCountSources'),
            SourceType(name='Transmission storage tanks', json_key='transmissionStorageTanks'),
            SourceType(
                name='Enhanced oil recovery injection pump blowdowns',
                json_key='enhancedOilrecoveryInjectionPumpBlowdowns',
            ),
            SourceType(
                name='Produced water dissolved carbon dioxide and methane',
                json_key='producedWaterDissolvedCarbonDioxideMethane',
            ),
            SourceType(
                name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
                json_key='enhancedOilRecoveryHydrocarbonLiquids',
            ),
            SourceType(name='Other venting sources', json_key='otherVentingSources'),
            SourceType(name='Other fugitive sources', json_key='otherFugitiveSources'),
            SourceType(name='Third party line hits with release of gas', json_key='thirdPartyLineHitsWithReleaseOfGas'),
            SourceType(name='Well venting for liquids unloading', json_key='wellVentingForLiquidsUnloading'),
            SourceType(
                name='Gas well venting during well completions and workovers with or without hydraulic fracturing',
                json_key='wellVentingDuringWellCompletionsHydraulicFracturing',
            ),
            SourceType(name='Drilling flaring', json_key='drillingFlaring'),
            SourceType(name='Drilling venting', json_key='drillingVenting'),
            SourceType(name='Hydraulic fracturing flaring', json_key='hydraulicFracturingFlaring'),
            SourceType(name='Well testing venting', json_key='wellTestingVenting'),
            SourceType(name='Well testing flaring', json_key='wellTestingFlaring'),
            SourceType(name='Flare stacks', json_key='flareStacks'),
        ]
    )


def reverse_init_source_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.source_type
    '''
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.filter(
        name__in=[
            'General stationary combustion of fuel or waste with production of useful energy',
            'General stationary combustion of waste without production of useful energy',
            'Fuel combustion by mobile equipment that is part of the facility',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'Anode effects',
            'Cover gas from electrolysis cells',
            'Steam reformation or gasification of a hydrocarbon during ammonia production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'Coal when broken or exposed to the atmosphere during mining',
            'Stored coal piles',
            'Removal of impurities using carbonate flux reagents',
            'Use of reducing agents',
            'Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes',
            'The solvent extraction and electrowinning process, also known as SX-EW',
            'Fuel combustion for electricity generation',
            'Acid gas scrubbers and acid gas reagents',
            'Cooling units',
            'Geothermal geyser steam or fluids',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes',
            'Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production',
            'Calcination of carbonate materials',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'Industrial wastewater process using anaerobic digestion',
            'Oil-water separators',
            'Use of reducing agents during lead production',
            'Calcination of carbonate materials in lime manufacturing',
            'Use of reducing agents in magnesium production',
            'Cover gases or carrier gases in magnesium production',
            'Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing',
            'Flares and oxidizers',
            'Process vents',
            'Equipment leaks',
            'Ethylene production',
            'Process units',
            'Catalyst regeneration',
            'Asphalt production',
            'Sulphur recovery',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'Above-ground storage tanks at refineries',
            'Oil-water separators at refineries',
            'Equipment leaks at refineries',
            'Wastewater processing using anaerobic digestion at refineries',
            'Uncontrolled blowdown systems used at refineries',
            'Loading operations at refineries and terminals',
            'Delayed coking units at refineries',
            'Coke calcining at refineries',
            'Reaction of calcium carbonate with sulphuric acid',
            'Pulping and chemical recovery',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'Use of reducing agents during zinc production',
            'Above-ground storage tanks',
            'Carbonates used but not consumed in other activities set out in column 2',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'Natural gas pneumatic high bleed device venting',
            'Natural gas pneumatic pump venting',
            'Natural gas pneumatic low bleed device venting',
            'Natural gas pneumatic intermittent bleed device venting',
            'Acid gas removal venting or incineration',
            'Dehydrator venting',
            'Blowdown venting',
            'Releases from tanks used for storage, production or processing',
            'Associated gas venting',
            'Associated gas flaring',
            'Flaring stacks',
            'Centrifugal compressor venting',
            'Reciprocating compressor venting',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'Population count sources',
            'Transmission storage tanks',
            'Enhanced oil recovery injection pump blowdowns',
            'Produced water dissolved carbon dioxide and methane',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'Other venting sources',
            'Other fugitive sources',
            'Third party line hits with release of gas',
            'Well venting for liquids unloading',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'Drilling flaring',
            'Drilling venting',
            'Hydraulic fracturing flaring',
            'Well testing venting',
            'Well testing flaring',
            'Flare stacks',
        ]
    ).delete()


def init_gas_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.gas_type
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.bulk_create(
        [
            GasType(name='Carbon Dioxide', chemical_formula='CO2'),
            GasType(name='Nitrous Oxide', chemical_formula='N2O'),
            GasType(name='Methane', chemical_formula='CH4'),
            GasType(name='Sulfur Hexafluoride', chemical_formula='SF6'),
            GasType(name='Tetrafluoromethane', chemical_formula='CF4'),
            GasType(name='Perfluoroethane', chemical_formula='C2F6'),
            GasType(name='Difluoromethane', chemical_formula='CH2F2'),
            GasType(name='Pentafluoroethane', chemical_formula='C2HF5'),
            GasType(name='1,1,1,2-Tetrafluoroethane', chemical_formula='C2H2F4'),
        ]
    )


def reverse_init_gas_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.gas_type
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.filter(
        chemical_formula__in=['CO2', 'N2O', 'CH4', 'SF6', 'CF4', 'C2F6', 'CH2F2', 'C2HF5', 'C2H2F4']
    ).delete()


def init_fuel_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.fuel_type
    '''
    FuelType = apps.get_model('reporting', 'FuelType')
    FuelType.objects.bulk_create(
        [
            FuelType(name="Acetylene", unit="Sm^3"),
            FuelType(name="Agricultural Byproducts", unit="bone dry tonnes"),
            FuelType(name="ANFO", unit="tonnes"),
            FuelType(name="Anthracite Coal", unit="tonnes"),
            FuelType(name="Asphalt & Road Oil", unit="kilolitres"),
            FuelType(name="Aviation Gasoline", unit="kilolitres"),
            FuelType(name="Aviation Turbo Fuel", unit="kilolitres"),
            FuelType(name="Biodiesel (100%)", unit="kilolitres"),
            FuelType(name="Biogas (captured methane)", unit="Sm^3"),
            FuelType(name="Bituminous Coal", unit="tonnes"),
            FuelType(name="Bone char - organics", unit="tonnes"),
            FuelType(name="Butane", unit="kilolitres"),
            FuelType(name="Butylene", unit="kilolitres"),
            FuelType(name="Carpet fibre", unit="tonnes"),
            FuelType(name="Coal Coke", unit="tonnes"),
            FuelType(name="Coke Oven Gas", unit="Sm^3"),
            FuelType(name="Comubistlbe Tall Oil", unit="kilolitres"),
            FuelType(name="Concentrated Non-Condensible Gases (CNCGs)", unit="Sm^3"),
            FuelType(name="Crude Oil", unit="kilolitres"),
            FuelType(name="Crude Sulfate Turpentine (CST)", unit="kilolitres"),
            FuelType(name="Crude Tall Oil (CTO)", unit="kilolitres"),
            FuelType(name="Diesel", unit="kilolitres"),
            FuelType(name="Digester Gas", unit="Sm^3"),
            FuelType(name="Dilute non-condensible gases (DNCGs)", unit="Sm^3"),
            FuelType(name="Distilate Fuel Oil No.1", unit="kilolitres"),
            FuelType(name="Distilate Fuel Oil No.2", unit="kilolitres"),
            FuelType(name="Distilate Fuel Oil No.4", unit="kilolitres"),
            FuelType(name="Ethane", unit="kilolitres"),
            FuelType(name="Ethanol (100%)", unit="kilolitres"),
            FuelType(name="Ethylene", unit="kilolitres"),
            FuelType(name="E-waste", unit="tonnes"),
            FuelType(name="Explosives", unit="tonnes"),
            FuelType(name="Field gas", unit="Sm^3"),
            FuelType(name="Field gas or process vent gas", unit="Sm^3"),
            FuelType(name="Foreign Bituminous Coal", unit="tonnes"),
            FuelType(name="Gasoline", unit="kilolitres"),
            FuelType(name="Isobutane", unit="kilolitres"),
            FuelType(name="Isobutylene", unit="kilolitres"),
            FuelType(name="Kerosene", unit="kilolitres"),
            FuelType(name="Kerosene -type Jet Fuel", unit="kilolitres"),
            FuelType(name="Landfill Gas", unit="Sm^3"),
            FuelType(name="Light Fuel Oil", unit="kilolitres"),
            FuelType(name="Lignite", unit="tonnes"),
            FuelType(name="Liquified Petroleum Gases (LPG)", unit="kilolitres"),
            FuelType(name="Lubricants", unit="kilolitres"),
            FuelType(name="Motor Gasoline - Off-road", unit="kilolitres"),
            FuelType(name="Motor Gasoline", unit="kilolitres"),
            FuelType(name="Municipal Solid Waste - non-biomass component", unit="tonnes"),
            FuelType(name="Municipal Solide Waste - biomass component", unit="bone dry tonnes"),
            FuelType(name="Naphtha", unit="kilolitres"),
            FuelType(name="Natural Gas", unit="Sm^3"),
            FuelType(name="Natural Gasoline", unit="kilolitres"),
            FuelType(name="Nitrous Oxide", unit="Sm^3"),
            FuelType(name="Oily Rags", unit=""),
            FuelType(name="Peat", unit="bone dry tonnes"),
            FuelType(name="Petrochemical Feedstocks", unit="kilolitres"),
            FuelType(name="Petroleum Coke - Refinery Use", unit="kilolitres"),
            FuelType(name="Petroleum Coke - Upgrader Use", unit="kilolitres"),
            FuelType(name="Petroleum Coke", unit="kilolitres"),
            FuelType(name="Plastic Recycle", unit=""),
            FuelType(name="Plastics", unit="tonnes"),
            FuelType(name="Process vent gas", unit="Sm^3"),
            FuelType(name="Propane", unit="kilolitres"),
            FuelType(name="Propylene", unit="kilolitres"),
            FuelType(name="Refinery Fuel Gas - Type 1", unit="Sm^3"),
            FuelType(name="Refinery Fuel Gas - Type 2", unit="Flexigas, m^3"),
            FuelType(name="Refinery Fuel Gas", unit="Sm^3"),
            FuelType(name="Rendered Animal Fat", unit="kilolitres"),
            FuelType(name="Renewable diesel", unit="kilolitres"),
            FuelType(name="Renewable natural gas", unit="Sm^3"),
            FuelType(name="Residual Fuel Oil (#5 & 6)", unit="kilolitres"),
            FuelType(name="SMR PSA Tail Gas", unit="Sm^3"),
            FuelType(name="Sodium Bicarbonate", unit="tonnes"),
            FuelType(name="Solid Byproducts", unit="bone dry tonnes"),
            FuelType(name="Special substance X", unit=""),
            FuelType(name="Spent Pulping Liquor", unit="bone dry tonnes"),
            FuelType(name="Still Gas - Refineries", unit="Sm^3"),
            FuelType(name="Still Gas - Upgrader Use", unit="Sm^3"),
            FuelType(name="Still gas", unit="Sm^3"),
            FuelType(name="Sub-Bituminous Coal", unit="tonnes"),
            FuelType(name="Tail gas", unit="Sm^3"),
            FuelType(name="Tires - biomass component", unit="bone dry tonnes"),
            FuelType(name="Tires - non-biomass component", unit="tonnes"),
            FuelType(name="Trona", unit=""),
            FuelType(name="Turpentine", unit="kilolitres"),
            FuelType(name="Vegetable Oil", unit="kilolitres"),
            FuelType(name="Waste Plastics", unit=""),
            FuelType(name="Wood Waste", unit="bone dry tonnes"),
        ]
    )


def reverse_init_fuel_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.fuel_type
    '''
    FuelType = apps.get_model('reporting', 'FuelType')
    FuelType.objects.filter(
        name__in=[
            "Acetylene",
            "Agricultural Byproducts",
            "ANFO",
            "Anthracite Coal",
            "Asphalt & Road Oil",
            "Aviation Gasoline",
            "Aviation Turbo Fuel",
            "Biodiesel (100%)",
            "Biogas (captured methane)",
            "Bituminous Coal",
            "Bone char - organics",
            "Butane",
            "Butylene",
            "Carpet fibre",
            "Coal Coke",
            "Coke Oven Gas",
            "Comubistlbe Tall Oil",
            "Concentrated Non-Condensible Gases (CNCGs)",
            "Crude Oil",
            "Crude Sulfate Turpentine (CST)",
            "Crude Tall Oil (CTO)",
            "Diesel",
            "Digester Gas",
            "Dilute non-condensible gases (DNCGs)",
            "Distilate Fuel Oil No.1",
            "Distilate Fuel Oil No.2",
            "Distilate Fuel Oil No.4",
            "Ethane",
            "Ethanol (100%)",
            "Ethylene",
            "E-waste",
            "Explosives",
            "Field gas",
            "Field gas or process vent gas",
            "Foreign Bituminous Coal",
            "Gasoline",
            "Isobutane",
            "Isobutylene",
            "Kerosene",
            "Kerosene -type Jet Fuel",
            "Landfill Gas",
            "Light Fuel Oil",
            "Lignite",
            "Liquified Petroleum Gases",
            "Lubricants",
            "Motor Gasoline - Off-road",
            "Motor Gasoline",
            "Municipal Solid Waste - non-biomass component",
            "Municipal Solide Waste - biomass component",
            "Naphtha",
            "Natural Gas",
            "Natural Gasoline",
            "Nitrous Oxide",
            "Oily Rags",
            "Peat",
            "Petrochemical Feedstocks",
            "Petroleum Coke - Refinery Use",
            "Petroleum Coke - Upgrader Use",
            "Petroleum Coke",
            "Plastic Recycle",
            "Plastics",
            "Process vent gas",
            "Propane",
            "Propylene",
            "Refinery Fuel Gas - Type 1",
            "Refinery Fuel Gas - Type 2",
            "Refinery Fuel Gas",
            "Rendered Animal Fat",
            "Renewable diesel",
            "Renewable natural gas",
            "Residual Fuel Oil (#5 & 6)",
            "SMR PSA Tail Gas",
            "Sodium Bicarbonate",
            "Solid Byproducts",
            "Special substance X",
            "Spent Pulping Liquor",
            "Still Gas - Refineries",
            "Still Gas - Upgrader Use",
            "Still gas",
            "Sub-Bituminous Coal",
            "Tail gas",
            "Tires - biomass component",
            "Tires - non-biomass component",
            "Trona",
            "Turpentine",
            "Vegetable Oil",
            "Waste Plastics",
            "Wood Waste",
        ]
    ).delete()


def init_methodology_data(apps, schema_monitor):
    '''
    Add initial data to erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.bulk_create(
        [
            Methodology(name='Default HHV/Default EF'),
            Methodology(name='Default EF'),
            Methodology(name='Measured HHV/Default EF'),
            Methodology(name='Measured Steam/Default EF'),
            Methodology(name='Measured CC'),
            Methodology(name='Measured Steam/Measured EF'),
            Methodology(name='Alternative Parameter Measurement'),
            Methodology(name='Replacement Methodology'),
            Methodology(name='Anode Consumption'),
            Methodology(name='Slope method'),
            Methodology(name='Overvoltage method'),
            Methodology(name='C2F6 anode effects'),
            Methodology(name='Inventory'),
            Methodology(name='Input/output'),
            Methodology(name='Heat Input/Default EF'),
            Methodology(name='Measured EF'),
            Methodology(name='Site-specific EF'),
            Methodology(name='CEMS'),
            Methodology(name='Measured CC and MW'),
        ]
    )


def reverse_init_methodology_data(apps, schema_monitor):
    '''
    Remove initial data from erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.filter(
        name__in=[
            'Default HHV/Default EF',
            'Default EF',
            'Measured HHV/Default EF',
            'Measured Steam/Default EF',
            'Measured CC',
            'Measured Steam/Measured EF',
            'Alternative Parameter Measurement',
            'Replacement Methodology',
            'Anode Consumption',
            'Slope method',
            'Overvoltage method',
            'C2F6 anode effects',
            'Inventory',
            'Input/output',
            'Heat Input/Default EF',
            'Measured EF',
            'Site-specific EF',
            'CEMS',
            'Measured CC and MW',
        ]
    ).delete()


def init_reporting_years(apps, schema_editor):
    '''
    Add initial year data to erc.reporting_year
    '''
    from django.core.management import call_command

    fixture_files = [
        'reporting/fixtures/mock/reporting_year.json',
    ]

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


def reverse_init_reporting_years(apps, schema_editor):
    '''
    Remove initial year data from erc.reporting_year
    '''
    ReportingYears = apps.get_model('reporting', 'ReportingYear')
    ReportingYears.objects.filter(reporting_year__in=[2023, 2024]).delete()


def init_reporting_field_data(apps, schema_monitor):
    '''
    Add initial data to erc.reporting_field
    '''

    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.bulk_create(
        [
            ReportingField(field_name='Fuel Default High Heating Value', field_type='number', field_units=None),
            ReportingField(
                field_name='Unit-Fuel-CO2 Default Emission Factor', field_type='number', field_units='kg/GJ'
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Default Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(
                field_name='Fuel Annual Weighted Average High Heating Value', field_type='number', field_units=None
            ),
            ReportingField(field_name='Unit-Fuel Annual Steam Generated', field_type='number', field_units=None),
            ReportingField(field_name='Boiler Ratio', field_type='number', field_units=None),
            ReportingField(field_name='Unit-Fuel-CO2 Emission Factor', field_type='number', field_units='kg/GJ'),
            ReportingField(
                field_name='Fuel Annual Weighted Average Carbon Content (weight fraction)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Measured Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(field_name='Description', field_type='string', field_units=None),
            ReportingField(
                field_name='Unit-Fuel-CH4 Default Emission Factor', field_type='number', field_units='kg/GJ'
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Default Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Measured Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(field_name='Unit-Fuel Heat Input', field_type='number', field_units=None),
            ReportingField(
                field_name='Unit-Fuel-N2O Default Emission Factor', field_type='number', field_units='kg/GJ'
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Default Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Measured Emission Factor', field_type='number', field_units='kg/fuel units'
            ),
            ReportingField(field_name='Annual Weighted Average Carbon Content', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual Weighted Average Molecular Weight', field_type='number', field_units=None
            ),
            ReportingField(field_name='Molar Volume Conversion Factor', field_type='number', field_units=None),
        ]
    )


def reverse_init_reporting_field_data(apps, schema_monitor):
    '''
    Remove initial data from erc.reporting_field
    '''
    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.filter(
        field_name__in=[
            'Unit-Fuel-CO2 Measured Emission Factor',
            'Unit-Fuel Heat Input',
            'Unit-Fuel-CO2 Default Emission Factor',
            'Unit-Fuel-CH4 Measured Emission Factor',
            'Unit-Fuel Annual Steam Generated',
            'Description',
            'Unit-Fuel-CO2 Emission Factor',
            'Boiler Ratio',
            'Unit-Fuel-N2O Default Emission Factor',
            'Unit-Fuel-CH4 Default Emission Factor',
            'Fuel Annual Weighted Average High Heating Value',
            'Unit-Fuel-N2O Measured Emission Factor',
            'Fuel Default High Heating Value',
            'Fuel Annual Weighted Average Carbon Content (weight fraction)',
            'Annual Weighted Average Carbon Content',
            'Annual Weighted Average Molecular Weight',
            'Molar Volume Conversion Factor',
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0007_reinit'),
    ]

    operations = [
        migrations.RunPython(init_source_type_data, reverse_init_source_type_data),
        migrations.RunPython(init_gas_type_data, reverse_init_gas_type_data),
        migrations.RunPython(init_fuel_type_data, reverse_init_fuel_type_data),
        migrations.RunPython(init_methodology_data, reverse_init_methodology_data),
        migrations.RunPython(init_configuration_data, reverse_init_configuration_data),
        migrations.RunPython(init_reporting_years, reverse_init_reporting_years),
        migrations.RunPython(init_reporting_field_data, reverse_init_reporting_field_data),
    ]