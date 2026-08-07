import os
import json
from decimal import Decimal
from datetime import datetime
from django.utils import timezone


def init_naics_regulatory_value_data(apps, schema_editor):
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsRegulatoryValue = apps.get_model('reporting', 'NaicsRegulatoryValue')
    NaicsRegulatoryValue.objects.bulk_create(
        [
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=111412).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=111419).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221111).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221112).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221119).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221121).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221210).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221320).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=221330).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=486110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=493110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=493190).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=562210).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=811199).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=211110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212114).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212220).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212231).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212233).id),
                reduction_factor='0.8',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=212299).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=213118).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311119).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311310).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=311614).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321111).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321212).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321216).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=321999).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322111).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322112).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322121).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=322122).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=324110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325120).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325181).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325189).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=325190).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327310).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327410).id),
                reduction_factor='0.9',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327420).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=327990).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331222).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331313).id),
                reduction_factor='0.95',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331410).id),
                reduction_factor='0.85',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=331511).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=412110).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            NaicsRegulatoryValue(
                naics_code_id=(NaicsCode.objects.get(naics_code=486210).id),
                reduction_factor='0.65',
                tightening_rate='0.01',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
        ]
    )


def reverse_init_naics_regulatory_value_data(apps, schema_editor):
    NaicsRegulatoryValue = apps.get_model('reporting', 'NaicsRegulatoryValue')
    NaicsRegulatoryValue.objects.all().delete()


def init_source_type_data(apps, schema_editor):
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


def reverse_init_source_type_data(apps, schema_editor):
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.all().delete()


def init_gas_type_data(apps, schema_editor):
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.bulk_create(
        [
            GasType(name='Carbon Dioxide', chemical_formula='CO2', gwp=1, cas_number='124-38-9'),
            GasType(name='Nitrous Oxide', chemical_formula='N2O', gwp=265, cas_number='10024-97-2'),
            GasType(name='Methane', chemical_formula='CH4', gwp=28, cas_number='74-82-8'),
            GasType(name='Sulfur Hexafluoride', chemical_formula='SF6', gwp=23500, cas_number='2551-62-4'),
            GasType(name='Tetrafluoromethane', chemical_formula='CF4', gwp=6630, cas_number='75-73-0'),
            GasType(name='Perfluoroethane', chemical_formula='C2F6', gwp=11100, cas_number='76-16-4'),
            GasType(name='Difluoromethane', chemical_formula='HFC-32 (CH2F2)', gwp=677, cas_number='75-10-5'),
            GasType(name='Pentafluoroethane', chemical_formula='HFC-125 (C2HF5)', gwp=3170, cas_number='354-33-6'),
            GasType(
                name='1,1,1,2-Tetrafluoroethane', chemical_formula='HFC-134a (C2H2F4)', gwp=1300, cas_number='811-97-2'
            ),
            GasType(name='Trifluoromethane', chemical_formula='HFC-23 (CHF3)', gwp=12400, cas_number='75-46-7'),
            GasType(name='Fluoromethane', chemical_formula='HFC-41 (CH3F)', gwp=116, cas_number='593-53-3'),
            GasType(
                name='1,1,1,2,3,4,4,5,5,5-decafluoropentane',
                chemical_formula='HFC-43-10mee (C5H2F10)',
                gwp=1650,
                cas_number='138495-42-8',
            ),
            GasType(
                name='1,1,2,2-tetrafluoroethane', chemical_formula='HFC-134 (C2H2F4)', gwp=1120, cas_number='359-35-3'
            ),
            GasType(name='1,1,2-trifluoroethane', chemical_formula='HFC-143 (C2H3F3)', gwp=328, cas_number='430-66-0'),
            GasType(
                name='1,1,1-trifluoroethane', chemical_formula='HFC-143a (C2H3F3)', gwp=4800, cas_number='420-46-2'
            ),
            GasType(name='1,1-difluoroethane', chemical_formula='HFC-152a (C2H4F2)', gwp=138, cas_number='75-37-6'),
            GasType(
                name='1,1,1,2,3,3,3-heptafluoro-propane',
                chemical_formula='HFC-227ea (C3HF7)',
                gwp=3350,
                cas_number='431-89-0',
            ),
            GasType(
                name='1,1,1,3,3,3-hexafluoro-propane',
                chemical_formula='HFC-236fa (C3H2F6)',
                gwp=8060,
                cas_number='690-39-1',
            ),
            GasType(
                name='1,1,2,2,3-pentafluoro-propane',
                chemical_formula='HFC-245ca (C3H3F5)',
                gwp=716,
                cas_number='679-86-7',
            ),
            GasType(name='Perfluoropropane', chemical_formula='C3F8', gwp=8900, cas_number='76-19-7'),
            GasType(name='Perfluorobutane', chemical_formula='C4F10', gwp=9200, cas_number='355-25-9'),
            GasType(name='Perfluorocyclobutane', chemical_formula='c-C4F8', gwp=9540, cas_number='115-25-3'),
            GasType(name='Perfluoropentane', chemical_formula='C5F12', gwp=8550, cas_number='678-26-2'),
            GasType(name='Perfluorohexane', chemical_formula='C6F14', gwp=7910, cas_number='355-42-0'),
        ]
    )


def reverse_init_gas_type_data(apps, schema_editor):
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.all().delete()


def init_configuration_data(apps, schema_editor):
    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.bulk_create([Configuration(slug='2024', valid_from='2023-01-01', valid_to='2099-12-31')])


def reverse_init_configuration_data(apps, schema_editor):
    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.all().delete()


def init_fuel_type_data(apps, schema_editor):
    FuelType = apps.get_model('reporting', 'FuelType')
    FuelType.objects.bulk_create(
        [
            FuelType(name="Acetylene", unit="Sm^3", classification="Exempted Non-biomass"),
            FuelType(name="Acid Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Aviation Gasoline", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Biodiesel (100%)", unit="kilolitres", classification="Other Exempted Biomass"),
            FuelType(name="Bituminous Coal", unit="tonnes", classification="Non-biomass"),
            FuelType(name="Butane", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="C/D Waste - Plastic", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="C/D Waste - Wood", unit="tonnes", classification="Other Exempted Biomass"),
            FuelType(name="Carpet fibre", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Coal Coke", unit="tonnes", classification="Non-biomass"),
            FuelType(name="Combustible Tall Oil", unit="kilolitres", classification="Woody Biomass"),
            FuelType(name="Concentrated Non-Condensible Gases (CNCGs)", unit="tonnes", classification="Woody Biomass"),
            FuelType(name="Crude Sulfate Turpentine (CST)", unit="kilolitres", classification="Woody Biomass"),
            FuelType(name="Crude Tall Oil (CTO)", unit="kilolitres", classification="Woody Biomass"),
            FuelType(name="Diesel", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Digester Gas", unit="Sm^3", classification="Other Exempted Biomass"),
            FuelType(name="Dilute non-condensible gases (DNCGs)", unit="Sm^3", classification="Woody Biomass"),
            FuelType(name="Distilate Fuel Oil No.2", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Ethanol (100%)", unit="kilolitres", classification="Other Exempted Biomass"),
            FuelType(name="E-waste", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Explosives", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Field gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="HTCR PSA Tail gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Hydrogen", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Hydrogenator Outlet Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Isobutylene", unit="kilolitres", classification="Exempted Non-biomass"),
            FuelType(name="Kerosene", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Landfill Gas", unit="Sm^3", classification="Other Exempted Biomass"),
            FuelType(name="Light Fuel Oil", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Liquified Petroleum Gases (LPG)", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Lubricants", unit="kilolitres", classification="Exempted Non-biomass"),
            FuelType(name="Motor Gasoline", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Motor Gasoline - Off-road", unit="kilolitres", classification="Non-biomass"),
            FuelType(
                name="Municipal Solid Waste - non-biomass component",
                unit="tonnes",
                classification="Exempted Non-biomass",
            ),
            FuelType(
                name="Municipal Solide Waste - biomass component",
                unit="bone dry tonnes",
                classification="Other Exempted Biomass",
            ),
            FuelType(name="Naphtha", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Natural Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Natural Gas Condensate", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Nitrous Oxide", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Petroleum Coke", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Pentanes Plus", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Plastics", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Propane", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="Propylene", unit="kilolitres", classification="Exempted Non-biomass"),
            FuelType(name="PSA Offgas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="PSA Process Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="RDU Offgas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Recycle Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Refinery Fuel Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Renewable Diesel", unit="kilolitres", classification="Other Exempted Biomass"),
            FuelType(name="Renewable Natural Gas", unit="Sm^3", classification="Other Exempted Biomass"),
            FuelType(name="Residual Fuel Oil (#5 & 6)", unit="kilolitres", classification="Non-biomass"),
            FuelType(name="SMR PSA Tail Gas", unit="Sm^3", classification="Exempted Non-biomass"),
            FuelType(name="Sodium Bicarbonate", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Solid Byproducts", unit="bone dry tonnes", classification="Other Exempted Biomass"),
            FuelType(name="Sour Gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Spent Pulping Liquor", unit="bone dry tonnes", classification="Woody Biomass"),
            FuelType(name="Still gas", unit="Sm^3", classification="Non-biomass"),
            FuelType(name="Sub-Bituminous Coal", unit="bone dry tonnes", classification="Non-biomass"),
            FuelType(name="Tires - biomass component", unit="bone dry tonnes", classification="Non-exempted Biomass"),
            FuelType(name="Tires - non-biomass component", unit="tonnes", classification="Non-biomass"),
            FuelType(name="Trona", unit="tonnes", classification="Exempted Non-biomass"),
            FuelType(name="Turpentine", unit="kilolitres", classification="Woody Biomass"),
            FuelType(name="Wood Waste", unit="bone dry tonnes", classification="Woody Biomass"),
        ]
    )


def reverse_init_fuel_type_data(apps, schema_editor):
    FuelType = apps.get_model('reporting', 'FuelType')
    FuelType.objects.all().delete()


def init_methodology_data(apps, schema_editor):
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.bulk_create(
        [
            Methodology(name='Default HHV/Default EF'),
            Methodology(name='Default EF'),
            Methodology(name='Measured HHV/Default EF'),
            Methodology(name='Measured Steam/Default EF'),
            Methodology(name='Measured CC'),
            Methodology(name='Measured Steam/Measured EF'),
            Methodology(name='Alternative Parameter Measurement Methodology'),
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
            Methodology(name='Feedstock Material Balance'),
            Methodology(name='Emissions Factor Methodology'),
            Methodology(name='WCI.203(f)(1)'),
            Methodology(name='WCI.203(f)(2)'),
            Methodology(name='Anode Consumption - Prebaked'),
            Methodology(name='Anode Consumption - Soderberg'),
            Methodology(name='Anode/Cathode Baking'),
            Methodology(name='Green Coke Calcination'),
            Methodology(name='Chemical Oxygen Demand'),
            Methodology(name='Biochemical Oxygen Demand'),
            Methodology(name='Nitrogen in effluent'),
            Methodology(name='Default conversion factor'),
            Methodology(name='Measured conversion factor'),
            Methodology(name='Calcination Fraction'),
            Methodology(name='Mass of Output Carbonates'),
            Methodology(name='Solids-HHV'),
            Methodology(name='Solids-CC'),
            Methodology(name='Make-up Chemical Use Methodology'),
            Methodology(name='Default emission factor'),
            Methodology(name='Measured emission factor'),
            Methodology(name="WCI.203(a)(1)"),
            Methodology(name="WCI.203(a)(2)"),
            Methodology(name="WCI.203(a)(3)"),
            Methodology(name="WCI.203(b)"),
            Methodology(name="WCI.203(c)"),
            Methodology(name="WCI.203(d)"),
            Methodology(name="WCI.203(e)(1)"),
            Methodology(name="WCI.203(e)(2)(A)(i)"),
            Methodology(name="WCI.203(e)(2)(A)(ii)"),
            Methodology(name="WCI.203(e)(B)"),
            Methodology(name="WCI.203(e)(3)(A)"),
            Methodology(name="WCI.203(e)(3)(B)"),
            Methodology(name="WCI.203(i)(1)"),
            Methodology(name="WCI.203(i)(2)"),
            Methodology(name="WCI.203(j)(2)"),
            Methodology(name="WCI.203(l)"),
            Methodology(name="WCI.203(m)(1)"),
            Methodology(name="WCI.203(m)(2)"),
            Methodology(name="Not Applicable"),
            Methodology(name="WCI.353 (a)(1)"),
            Methodology(name="WCI.353 (a)(2)"),
            Methodology(name="WCI.353 (a.1)(1)"),
            Methodology(name="WCI.353 (a.1)(2)"),
            Methodology(name="WCI.353 (b)"),
            Methodology(name="WCI.353 (b.1)"),
            Methodology(name="WCI.353 (c)"),
            Methodology(name="WCI.353 (d)"),
            Methodology(name="WCI.353 (g)"),
            Methodology(name="CEPEI Methodology Manual"),
            Methodology(name="WCI.353 (h)"),
            Methodology(name="WCI.353 (m)"),
            Methodology(name="Other CGA Methodology"),
            Methodology(name="WCI.353 (c.1)(i)"),
            Methodology(name="WCI.353 (c.1)(ii)"),
            Methodology(name="WCI.353 (e)"),
            Methodology(name="WCI.353 (f)"),
            Methodology(name="WCI.363 (c)"),
            Methodology(name="WCI.363 (d)"),
            Methodology(name="WCI.363 (h)(1)"),
            Methodology(name="WCI.363 (h)(2)"),
            Methodology(name="WCI.363 (h)(3)"),
            Methodology(name="WCI.363 (h)(4)"),
            Methodology(name="WCI.363 (t)"),
            Methodology(name="WCI.363 (a)(1)"),
            Methodology(name="WCI.363 (a.1)(1)"),
            Methodology(name="WCI.363 (b)"),
            Methodology(name="WCI.363 (b.1)"),
            Methodology(name="WCI.363 (e)"),
            Methodology(name="WCI.363 (f)(1)"),
            Methodology(name="WCI.363 (f)(2)"),
            Methodology(name="WCI.363 (k)"),
            Methodology(name="WCI.363 (g)"),
            Methodology(name="WCI.363 (o)"),
            Methodology(name="WCI.363 (h.1)"),
            Methodology(name="WCI.363 (i)"),
            Methodology(name="WCI.363 (j)"),
            Methodology(name="WCI.363 (n)"),
            Methodology(name="WCI.363 (g.1)(i)"),
            Methodology(name="WCI.363 (g.1)(ii)"),
            Methodology(name="2009 API Compendium"),
            Methodology(name="Other Methodology"),
            Methodology(name="WCI.363 (l)"),
            Methodology(name="WCI.363 (m)"),
            Methodology(name="Acid gas"),
            Methodology(name="Direct measurement"),
            Methodology(name="Mass balance"),
            Methodology(name="Measured heat"),
            Methodology(name="Calcination Emissions"),
            Methodology(name="Oxidation Emissions"),
            Methodology(name="Calculated"),
        ]
    )


def reverse_init_methodology_data(apps, schema_editor):
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.all().delete()


def init_reporting_years(apps, schema_editor):
    ReportingYear = apps.get_model('reporting', 'ReportingYear')
    ReportingYear.objects.bulk_create(
        [
            ReportingYear(
                reporting_year=2023,
                reporting_window_start="2024-01-01 00:00:00.000 -08:00",
                reporting_window_end="2024-12-31 23:59:59.999 -08:00",
                report_due_date="2024-05-31 23:59:59.999 -07:00",
                report_open_date=timezone.make_aware(datetime(2024, 3, 1, 0, 0, 0)),
            ),
            ReportingYear(
                reporting_year=2024,
                reporting_window_start="2025-01-01 00:00:00.000 -08:00",
                reporting_window_end="2025-12-31 23:59:59.999 -08:00",
                report_due_date="2025-05-31 23:59:59.999 -07:00",
                report_open_date=timezone.make_aware(datetime(2025, 3, 1, 0, 0, 0)),
            ),
            ReportingYear(
                reporting_year=2025,
                reporting_window_start="2026-01-01 00:00:00.000 -08:00",
                reporting_window_end="2026-12-31 23:59:59.999 -08:00",
                report_due_date="2026-05-31 23:59:59.999 -07:00",
                report_open_date=timezone.make_aware(datetime(2026, 3, 5, 0, 0, 0)),
            ),
            ReportingYear(
                reporting_year=2026,
                reporting_window_start="2027-01-01 00:00:00.000 -08:00",
                reporting_window_end="2027-12-31 23:59:59.999 -08:00",
                report_due_date="2027-05-31 23:59:59.999 -07:00",
                report_open_date=timezone.make_aware(datetime(2027, 3, 1, 0, 0, 0)),
            ),
        ]
    )


def reverse_init_reporting_years(apps, schema_editor):
    ReportingYears = apps.get_model('reporting', 'ReportingYear')
    ReportingYears.objects.all().delete()


def init_reporting_field_data(apps, schema_editor):
    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.bulk_create(
        [
            ReportingField(field_name='Fuel Default High Heating Value', field_type='number', field_units=None),
            ReportingField(
                field_name='Fuel Annual Weighted Average High Heating Value', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Unit-Fuel Annual Steam Generated',
                field_type='number',
                field_units=None,
                field_display_title='Annual Steam Generated',
            ),
            ReportingField(field_name='Boiler Ratio', field_type='number', field_units=None),
            ReportingField(
                field_name='Fuel Annual Weighted Average Carbon Content (weight fraction)',
                field_type='number',
                field_units='kg carbon/fuel unit',
            ),
            ReportingField(field_name='Description', field_type='string', field_units=None),
            ReportingField(
                field_name='Unit-Fuel Heat Input',
                field_type='number',
                field_units=None,
                field_display_title='Heat Input',
            ),
            ReportingField(
                field_name='Average of Quarterly chemical oxygen demand', field_type='number', field_units='kg/m3'
            ),
            ReportingField(
                field_name='Average of Quarterly five-day biochemical oxygen demand',
                field_type='number',
                field_units='kg/m3',
            ),
            ReportingField(
                field_name='Average of Quarterly Nitrogen in effluent', field_type='number', field_units='kg/N m3'
            ),
            ReportingField(field_name='Measured conversion factor', field_type='number', field_units='kgCH4/kgNMHC'),
            ReportingField(field_name='Annual Weighted Average Carbon Content', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual Weighted Average Molecular Weight', field_type='number', field_units=None
            ),
            ReportingField(field_name='Molar Volume Conversion Factor', field_type='number', field_units=None),
            ReportingField(field_name='Sulphur Content in Baked Anodes', field_type='number', field_units=None),
            ReportingField(field_name='Ash Content in Baked Anodes', field_type='number', field_units=None),
            ReportingField(field_name='Emissions of benzene-soluble matter', field_type='number', field_units=None),
            ReportingField(field_name='Average binder (pitch) content in paste', field_type='number', field_units=None),
            ReportingField(field_name='Sulphur content in pitch', field_type='number', field_units=None),
            ReportingField(field_name='Ash content in pitch', field_type='number', field_units=None),
            ReportingField(field_name='Hydrogen content in pitch', field_type='number', field_units=None),
            ReportingField(field_name='Sulphur content in calcinated coke', field_type='number', field_units=None),
            ReportingField(field_name='Ash content in calcinated coke', field_type='number', field_units=None),
            ReportingField(
                field_name='Carbon in skimmed dust from Søderberg cells', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Packing coke consumption per tonne of baked anode', field_type='number', field_units=None
            ),
            ReportingField(field_name='Baked anode production', field_type='number', field_units=None),
            ReportingField(field_name='Ash content in packing coke', field_type='number', field_units=None),
            ReportingField(field_name='Sulphur content in packing coke', field_type='number', field_units=None),
            ReportingField(field_name='Green anode consumption', field_type='number', field_units=None),
            ReportingField(field_name='Pitch content in green anode', field_type='number', field_units=None),
            ReportingField(field_name='Recovered tar', field_type='number', field_units=None),
            ReportingField(field_name='Green coke feed', field_type='number', field_units=None),
            ReportingField(field_name='Humidity in green coke feed', field_type='number', field_units=None),
            ReportingField(field_name='Volatiles in green coke feed', field_type='number', field_units=None),
            ReportingField(field_name='Sulphur content in green coke feed', field_type='number', field_units=None),
            ReportingField(field_name='Calcinated coke produced', field_type='number', field_units=None),
            ReportingField(field_name='Under-calcinated coke produced', field_type='number', field_units=None),
            ReportingField(field_name='Coke dust emissions', field_type='number', field_units=None),
            ReportingField(field_name='Anode Effect minutes per cell-day', field_type='number', field_units=None),
            ReportingField(field_name='Anode Effect Frequency', field_type='number', field_units=None),
            ReportingField(field_name='Anode Effect Duration', field_type='number', field_units=None),
            ReportingField(field_name='Frequency and Duration Methodology', field_type='string', field_units=None),
            ReportingField(field_name='Slope Coefficient', field_type='number', field_units=None),
            ReportingField(
                field_name='Last Date of Slope Coefficients Measurement', field_type='string', field_units=None
            ),
            ReportingField(field_name='Anode Effect Overvoltage Factor', field_type='number', field_units=None),
            ReportingField(field_name='Potline Overvoltage', field_type='number', field_units=None),
            ReportingField(field_name='Current Efficiency', field_type='number', field_units=None),
            ReportingField(field_name='Overvoltage Methodology', field_type='string', field_units=None),
            ReportingField(field_name='Overvoltage Emission Factor', field_type='number', field_units=None),
            ReportingField(
                field_name='Last Date of Overvoltage Emission Factor Measurement', field_type='string', field_units=None
            ),
            ReportingField(field_name='Amount of raw material consumed (t)', field_type='number', field_units=None),
            ReportingField(
                field_name='Raw material organic carbon content (weight fraction)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Default EF',
                field_type='number',
                field_units='kg/fuel units',
                field_display_title='CO2 Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Default HHV-Default EF',
                field_type='number',
                field_units='kg/GJ',
                field_display_title='CO2 Default HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Measured HHV-Default EF',
                field_type='number',
                field_units='kg/GJ',
                field_display_title='CO2 Measured HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Measured Steam-Default EF',
                field_type='number',
                field_units='kg/GJ',
                field_display_title='CO2 Measured Steam-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Measured Steam-Measured EF',
                field_type='number',
                field_units='kg/fuel units',
                field_display_title='CO2 Measured Steam-Measured EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CO2 Site-specific EF',
                field_type='number',
                field_units='kg/fuel units',
                field_display_title='CO2 Site-specific EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Default EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='CH4 Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Default HHV-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='CH4 Default HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Heat Input-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='CH4 Heat Input-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Measured EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='CH4 Measured EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Measured HHV-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='CH4 Measured HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Measured Steam-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='CH4 Measured Steam-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-CH4 Site-specific EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='CH4 Site-specific EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Default EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='N2O Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Default HHV-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='N2O Default HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Heat Input-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='N2O Heat Input-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Measured EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='N2O Measured EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Measured HHV-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='N2O Measured HHV-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Measured Steam-Default EF',
                field_type='number',
                field_units='g/GJ',
                field_display_title='N2O Measured Steam-Default EF',
            ),
            ReportingField(
                field_name='Unit-Fuel-N2O Site-specific EF',
                field_type='number',
                field_units='g/fuel units',
                field_display_title='N2O Site-specific EF',
            ),
            ReportingField(
                field_name='Annual mass of carbonate type consumed (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Fraction calcination achieved for each particular carbonate type (Weight factor)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(field_name='Number of carbonate types', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual mass of input carbonate type (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Annual mass of output carbonate type (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(field_name='Number of input carbonate types', field_type='number', field_units=None),
            ReportingField(field_name='Number of output carbonate types', field_type='number', field_units=None),
            ReportingField(field_name='Carbonate Name', field_type='string', field_units=None),
            ReportingField(field_name='Annual Amount (t)', field_type='number', field_units=None),
            ReportingField(field_name='Purity Of Carbonate (Weight Fraction)', field_type='number', field_units=None),
            ReportingField(
                field_name='Mass of spent liquor combusted (tonnes/year)', field_type='number', field_units=None
            ),
            ReportingField(field_name='Solids percentage by weight (%)', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual high heat value of spent liquor solids (GJ/kg)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Annual carbon content of spent liquor solids (% by weight)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Make-up quantity of CaCO3 used (tonnes/year)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Make-up quantity of Na2CO3 used (tonnes/year)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(field_name='Is Woody Biomass', field_type='boolean', field_units=None),
            ReportingField(
                field_name='Average of quarterly chemical oxygen demand (kg/m3)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Average of quarterly five-day biochemical oxygen demand (kg/m3)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Average of quarterly nitrogen in effluent (kg/N m3)',
                field_type='number',
                field_units=None,
            ),
        ]
    )


def reverse_init_reporting_field_data(apps, schema_editor):
    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.all().delete()


def init_activity_schema_data(apps, schema_editor):
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')

    valid_from = Configuration.objects.get(valid_from='2023-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')
    cwd = os.getcwd()

    ACTIVITY_SCHEMA_MAPPING = [
        ('General stationary combustion excluding line tracing', 'gsc_excluding_line_tracing'),
        ('General stationary combustion solely for the purpose of line tracing', 'gsc_solely_for_line_tracing'),
        ('Fuel combustion by mobile equipment', 'fuel_combustion_mobile'),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'gsc_other_than_non_compression',
        ),
        ('Refinery fuel gas combustion', 'refinery_fuel_gas'),
        ('Carbonate use', 'carbonates_use'),
        ('General stationary non-compression and non-processing combustion', 'gsc_non_compression_non_combustion'),
        ('Hydrogen production', 'hydrogen_production'),
        ('Pulp and paper production', 'pulp_and_paper_production'),
        ('Open pit coal mining', 'open_pit_coal_mining'),
        ('Storage of petroleum products', 'storage_of_petroleum_products'),
        ('Aluminum or alumina production', 'aluminum_production'),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
        ),
        ('LNG activities', 'lng_activities'),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
        ),
        ('Electricity generation', 'electricity_generation'),
        ('Industrial wastewater processing', 'industrial_water_processing'),
        ('Cement production', 'cement_production'),
        ('Lime manufacturing', 'lime_manufacturing'),
        ('Coal storage at facilities that combust coal', 'coal_storage'),
        ('Zinc production', 'zinc_production'),
        ('Petroleum refining', 'petroleum_refining'),
        ('Lead production', 'lead_production'),
        ('Electricity transmission', 'electricity_transmission'),
    ]

    for activity_name, schema_slug in ACTIVITY_SCHEMA_MAPPING:
        schema_path = f'{cwd}/reporting/json_schemas/2024/{schema_slug}/activity.json'
        with open(schema_path) as schema_file:
            schema = json.load(schema_file)
        ActivitySchema.objects.create(
            activity=Activity.objects.get(name=activity_name),
            json_schema=schema,
            valid_from=valid_from,
            valid_to=valid_to,
        )


def reverse_init_activity_schema_data(apps, schema_editor):
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    ActivitySchema.objects.all().delete()


def init_activity_source_type_schema_data(apps, schema_editor):
    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    valid_from = Configuration.objects.get(valid_from='2023-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')
    cwd = os.getcwd()

    ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING = [
        # GSC excluding line tracing
        (
            'General stationary combustion excluding line tracing',
            'gsc_excluding_line_tracing',
            'with_useful_energy',
            'General stationary combustion of fuel or waste with production of useful energy',
            True,
            True,
        ),
        (
            'General stationary combustion excluding line tracing',
            'gsc_excluding_line_tracing',
            'without_useful_energy',
            'General stationary combustion of waste without production of useful energy',
            True,
            True,
        ),
        # GSC solely for line tracing
        (
            'General stationary combustion solely for the purpose of line tracing',
            'gsc_solely_for_line_tracing',
            'with_useful_energy',
            'General stationary combustion of fuel or waste with production of useful energy',
            True,
            True,
        ),
        # Fuel combustion by mobile equipment
        (
            'Fuel combustion by mobile equipment',
            'fuel_combustion_mobile',
            'combustion_by_equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            False,
            True,
        ),
        # GSC other than non-compression
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'gsc_other_than_non_compression',
            'with_useful_energy',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            True,
            True,
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'gsc_other_than_non_compression',
            'without_useful_energy',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            True,
            True,
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'gsc_other_than_non_compression',
            'field_gas_process_vent_gas_at_lfo',
            'Field gas or process vent gas combustion at a linear facilities operation',
            True,
            True,
        ),
        # Refinery fuel gas combustion
        (
            'Refinery fuel gas combustion',
            'refinery_fuel_gas',
            'combustion_of_refinery_gas',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            False,
            True,
        ),
        # Carbonate use
        (
            'Carbonate use',
            'carbonates_use',
            'carbonates_use',
            'Carbonates used but not consumed in other activities set out in column 2',
            False,
            False,
        ),
        # GSC non-compression non-processing combustion
        (
            'General stationary non-compression and non-processing combustion',
            'gsc_non_compression_non_combustion',
            'with_useful_energy',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            True,
            True,
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'gsc_non_compression_non_combustion',
            'without_useful_energy',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            True,
            True,
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'gsc_non_compression_non_combustion',
            'field_gas_process_vent_gas_at_lfo',
            'Field gas or process vent gas combustion at a linear facilities operation',
            True,
            True,
        ),
        # Hydrogen production
        (
            'Hydrogen production',
            'hydrogen_production',
            'steam_reformation_or_gasification',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            False,
            False,
        ),
        # Pulp and paper production
        (
            'Pulp and paper production',
            'pulp_and_paper_production',
            'pulp_and_paper_production',
            'Pulping and chemical recovery',
            False,
            False,
        ),
        # Open pit coal mining
        (
            'Open pit coal mining',
            'open_pit_coal_mining',
            'coal_exposed_during_mining',
            'Coal when broken or exposed to the atmosphere during mining',
            False,
            False,
        ),
        # Storage of petroleum products
        (
            'Storage of petroleum products',
            'storage_of_petroleum_products',
            'above_ground_storage_tanks',
            'Above-ground storage tanks',
            False,
            False,
        ),
        # Aluminum or alumina production
        (
            'Aluminum or alumina production',
            'aluminum_production',
            'anode_consumption_acbgcc',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            False,
            False,
        ),
        ('Aluminum or alumina production', 'aluminum_production', 'anode_effects', 'Anode effects', False, False),
        (
            'Aluminum or alumina production',
            'aluminum_production',
            'cover_gas_from_electrolysis',
            'Cover gas from electrolysis cells',
            False,
            False,
        ),
        # NG non-compression
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '1_ng_pneumatic_high_bleed_device_venting',
            'Natural gas pneumatic high bleed device venting',
            True,
            True,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '2_ng_pneumatic_pump_venting',
            'Natural gas pneumatic pump venting',
            True,
            True,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '3_ng_pneumatic_low_bleed_device_venting',
            'Natural gas pneumatic low bleed device venting',
            True,
            True,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '4_ng_pneumatic_intermittent_device_venting',
            'Natural gas pneumatic intermittent bleed device venting',
            True,
            True,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '5_blowdown_venting',
            'Blowdown venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '6_flare_stacks',
            'Flare stacks',
            True,
            True,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '7_equipment_leaks_detected_using_leak_detection',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            True,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '8_population_count_sources',
            'Population count sources',
            True,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '9_transmission_storage_tanks',
            'Transmission storage tanks',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '10_other_venting_sources',
            'Other venting sources',
            True,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '11_other_fugitive_sources',
            'Other fugitive sources',
            True,
            False,
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
            '12_third_party_line_hits_with_release_of_gas',
            'Third party line hits with release of gas',
            True,
            False,
        ),
        # NG other than non-compression
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '1_ng_pneumatic_high_bleed_device_venting',
            'Natural gas pneumatic high bleed device venting',
            True,
            True,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '2_ng_pneumatic_pump_venting',
            'Natural gas pneumatic pump venting',
            True,
            True,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '3_ng_pneumatic_low_bleed_device_venting',
            'Natural gas pneumatic low bleed device venting',
            True,
            True,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '4_ng_pneumatic_intermittent_device_venting',
            'Natural gas pneumatic intermittent bleed device venting',
            True,
            True,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '5_blowdown_venting',
            'Blowdown venting',
            False,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '6_flare_stacks',
            'Flare stacks',
            True,
            True,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '7_centrifugal_compressor_venting',
            'Centrifugal compressor venting',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '8_reciprocating_compressor_venting',
            'Reciprocating compressor venting',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '9_equipment_leaks_detected_using_leak_detection',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '10_population_count_sources',
            'Population count sources',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '11_transmission_storage_tanks',
            'Transmission storage tanks',
            False,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '12_other_venting_sources',
            'Other venting sources',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '13_other_fugitive_sources',
            'Other fugitive sources',
            True,
            False,
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
            '14_third_party_line_hits_with_release_of_gas',
            'Third party line hits with release of gas',
            True,
            False,
        ),
        # LNG activities
        (
            'LNG activities',
            'lng_activities',
            '1_ng_pneumatic_high_bleed_device_venting',
            'Natural gas pneumatic high bleed device venting',
            False,
            True,
        ),
        (
            'LNG activities',
            'lng_activities',
            '2_ng_pneumatic_pump_venting',
            'Natural gas pneumatic pump venting',
            False,
            True,
        ),
        (
            'LNG activities',
            'lng_activities',
            '3_ng_pneumatic_low_bleed_device_venting',
            'Natural gas pneumatic low bleed device venting',
            False,
            True,
        ),
        (
            'LNG activities',
            'lng_activities',
            '4_ng_pneumatic_intermittent_device_venting',
            'Natural gas pneumatic intermittent bleed device venting',
            False,
            True,
        ),
        (
            'LNG activities',
            'lng_activities',
            '5_acid_gas_removal_venting_or_incineration',
            'Acid gas removal venting or incineration',
            True,
            False,
        ),
        ('LNG activities', 'lng_activities', '6_dehydrator_venting', 'Dehydrator venting', True, False),
        ('LNG activities', 'lng_activities', '7_blowdown_venting', 'Blowdown venting', False, False),
        (
            'LNG activities',
            'lng_activities',
            '8_releases_from_tanks_used_for_storage',
            'Releases from tanks used for storage, production or processing',
            True,
            False,
        ),
        ('LNG activities', 'lng_activities', '9_flare_stacks', 'Flare stacks', True, True),
        (
            'LNG activities',
            'lng_activities',
            '10_centrifugal_compressor_venting',
            'Centrifugal compressor venting',
            True,
            False,
        ),
        (
            'LNG activities',
            'lng_activities',
            '11_reciprocating_compressor_venting',
            'Reciprocating compressor venting',
            True,
            False,
        ),
        (
            'LNG activities',
            'lng_activities',
            '12_equipment_leaks_detected_using_leak_detection',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            True,
            False,
        ),
        ('LNG activities', 'lng_activities', '13_population_count_sources', 'Population count sources', True, False),
        (
            'LNG activities',
            'lng_activities',
            '14_transmission_storage_tanks',
            'Transmission storage tanks',
            False,
            False,
        ),
        (
            'LNG activities',
            'lng_activities',
            '15_enhanced_oil_recovery_injection_pump_blowdowns',
            'Enhanced oil recovery injection pump blowdowns',
            False,
            False,
        ),
        (
            'LNG activities',
            'lng_activities',
            '16_produced_water_dissolved_carbon_dioxide_methane',
            'Produced water dissolved carbon dioxide and methane',
            False,
            False,
        ),
        (
            'LNG activities',
            'lng_activities',
            '17_enhanced_oil_recovery_produced_hydrocarbon_liquids',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            False,
            False,
        ),
        ('LNG activities', 'lng_activities', '18_other_venting_sources', 'Other venting sources', True, False),
        ('LNG activities', 'lng_activities', '19_other_fugitive_sources', 'Other fugitive sources', True, False),
        (
            'LNG activities',
            'lng_activities',
            '20_third_party_line_hits_with_release_of_gas',
            'Third party line hits with release of gas',
            False,
            False,
        ),
        # OG extraction non-compression
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'associated_gas_flaring',
            'Associated gas flaring',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'associated_gas_venting',
            'Associated gas venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'blowdown_venting',
            'Blowdown venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'dehydrator_venting',
            'Dehydrator venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'drilling_flaring',
            'Drilling flaring',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'drilling_venting',
            'Drilling venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'equipment_leaks_using_leak_detection',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'flaring_stacks',
            'Flaring stacks',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'hydraulic_fracturing_flaring',
            'Hydraulic fracturing flaring',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'ng_high_bleed_venting',
            'Natural gas pneumatic high bleed device venting',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'ng_intermittent_venting',
            'Natural gas pneumatic intermittent bleed device venting',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'ng_low_bleed_venting',
            'Natural gas pneumatic low bleed device venting',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'ng_pump_venting',
            'Natural gas pneumatic pump venting',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'oil_recovery_injection_pump_blowdowns',
            'Enhanced oil recovery injection pump blowdowns',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'oil_recovery_produced_hydrocarbon',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'other_fugitive_sources',
            'Other fugitive sources',
            True,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'other_venting_sources',
            'Other venting sources',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'population_count_sources',
            'Population count sources',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'produced_water_dissolved_co2',
            'Produced water dissolved carbon dioxide and methane',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'releases_from_tanks_for_storage',
            'Releases from tanks used for storage, production or processing',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'third_party_line_hits',
            'Third party line hits with release of gas',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'transmission_storage_tanks',
            'Transmission storage tanks',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'well_testing_flaring',
            'Well testing flaring',
            False,
            True,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'well_testing_venting',
            'Well testing venting',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'well_venting_liquid_unloading',
            'Well venting for liquids unloading',
            False,
            False,
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
            'well_venting_well_completion',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            False,
            False,
        ),
        # OG extraction other than NCNP
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'ng_high_bleed_venting',
            'Natural gas pneumatic high bleed device venting',
            False,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'ng_intermittent_venting',
            'Natural gas pneumatic intermittent bleed device venting',
            False,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'ng_low_bleed_venting',
            'Natural gas pneumatic low bleed device venting',
            False,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'ng_pump_venting',
            'Natural gas pneumatic pump venting',
            False,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'acid_gas_removal_venting_or_incineration',
            'Acid gas removal venting or incineration',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'dehydrator_venting',
            'Dehydrator venting',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'blowdown_venting',
            'Blowdown venting',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'releases_from_tanks_used_for_storage',
            'Releases from tanks used for storage, production or processing',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'associated_gas_flaring',
            'Associated gas flaring',
            False,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'associated_gas_venting',
            'Associated gas venting',
            False,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'flaring_stacks',
            'Flaring stacks',
            True,
            True,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'centrifugal_compressor_venting',
            'Centrifugal compressor venting',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'reciprocating_compressor_venting',
            'Reciprocating compressor venting',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'equipment_leaks_detected_using_leak_detection',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'population_count_sources',
            'Population count sources',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'transmission_storage_tanks',
            'Transmission storage tanks',
            False,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'enhanced_oil_recovery_injection_pump_blowdowns',
            'Enhanced oil recovery injection pump blowdowns',
            False,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'produced_water_dissolved_carbon_dioxide_methane',
            'Produced water dissolved carbon dioxide and methane',
            False,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'enhanced_oil_recovery_produced_hydrocarbon_liquids',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            False,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'other_venting_sources',
            'Other venting sources',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'other_fugitive_sources',
            'Other fugitive sources',
            True,
            False,
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
            'third_party_line_hits',
            'Third party line hits with release of gas',
            False,
            False,
        ),
        # Electricity generation
        (
            'Electricity generation',
            'electricity_generation',
            '1_fuel_combustion_electricity_gen',
            'Fuel combustion for electricity generation',
            True,
            True,
        ),
        (
            'Electricity generation',
            'electricity_generation',
            '2_acid_gas_scrubbers_reagents',
            'Acid gas scrubbers and acid gas reagents',
            False,
            False,
        ),
        ('Electricity generation', 'electricity_generation', '3_cooling_units', 'Cooling units', False, False),
        (
            'Electricity generation',
            'electricity_generation',
            '4_geothermal_geyser_steam_fluids',
            'Geothermal geyser steam or fluids',
            False,
            False,
        ),
        (
            'Electricity generation',
            'electricity_generation',
            '5_electrical_equipment_install_maint_decom',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            False,
            False,
        ),
        # Industrial wastewater processing
        (
            'Industrial wastewater processing',
            'industrial_water_processing',
            'wastewater_processing_using_anaerobic',
            'Industrial wastewater process using anaerobic digestion',
            False,
            False,
        ),
        (
            'Industrial wastewater processing',
            'industrial_water_processing',
            'oil_water_separators',
            'Oil-water separators',
            False,
            False,
        ),
        # Cement production
        (
            'Cement production',
            'cement_production',
            'calcination_of_lssso',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            False,
            False,
        ),
        # Lime manufacturing
        (
            'Lime manufacturing',
            'lime_manufacturing',
            '1_calcination_of_carbonate',
            'Calcination of carbonate materials in lime manufacturing',
            False,
            False,
        ),
        # Coal storage
        (
            'Coal storage at facilities that combust coal',
            'coal_storage',
            '1_stored_coal_piles',
            'Stored coal piles',
            False,
            False,
        ),
        # Zinc production
        (
            'Zinc production',
            'zinc_production',
            '1_reducing agents',
            'Use of reducing agents during zinc production',
            False,
            False,
        ),
        # Petroleum refining
        ('Petroleum refining', 'petroleum_refining', '1_catalyst_regeneration', 'Catalyst regeneration', False, False),
        ('Petroleum refining', 'petroleum_refining', '2_process_vents', 'Process vents', False, False),
        ('Petroleum refining', 'petroleum_refining', '3_asphalt_production', 'Asphalt production', False, False),
        ('Petroleum refining', 'petroleum_refining', '4_sulphur_recovery', 'Sulphur recovery', False, False),
        (
            'Petroleum refining',
            'petroleum_refining',
            '5_flares',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '6_above_ground_storage_tanks',
            'Above-ground storage tanks at refineries',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '7_oil_water_separators',
            'Oil-water separators at refineries',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '8_equipment_leaks_at_refineries',
            'Equipment leaks at refineries',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '9_wastewater_processing',
            'Wastewater processing using anaerobic digestion at refineries',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '10_uncontrolled_blowdown_systems',
            'Uncontrolled blowdown systems used at refineries',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '11_loading_operations',
            'Loading operations at refineries and terminals',
            False,
            False,
        ),
        (
            'Petroleum refining',
            'petroleum_refining',
            '12_delayed_coking_units',
            'Delayed coking units at refineries',
            False,
            False,
        ),
        ('Petroleum refining', 'petroleum_refining', '13_coke_calcining', 'Coke calcining at refineries', False, False),
        # Lead production
        (
            'Lead production',
            'lead_production',
            '1_reducing agents',
            'Use of reducing agents during lead production',
            False,
            False,
        ),
        # Electricity transmission
        (
            'Electricity transmission',
            'electricity_transmission',
            'installation_maint_operation_electrical_equipment',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            False,
            False,
        ),
    ]

    for (
        activity_name,
        schema_dir,
        file_name,
        source_type_name,
        has_unit,
        has_fuel,
    ) in ACTIVITY_SOURCE_TYPE_SCHEMA_MAPPING:
        schema_path = f'{cwd}/reporting/json_schemas/2024/{schema_dir}/{file_name}.json'
        with open(schema_path) as schema_file:
            schema = json.load(schema_file)
        ActivitySourceTypeSchema.objects.create(
            activity=Activity.objects.get(name=activity_name),
            source_type=SourceType.objects.get(name=source_type_name),
            has_unit=has_unit,
            has_fuel=has_fuel,
            json_schema=schema,
            valid_from=valid_from,
            valid_to=valid_to,
        )


def reverse_init_activity_source_type_schema_data(apps, schema_editor):
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    ActivitySourceTypeJsonSchema.objects.all().delete()


def init_emission_category_data(apps, schema_editor):
    EmissionCategory = apps.get_model('reporting', 'EmissionCategory')
    EmissionCategory.objects.bulk_create(
        [
            EmissionCategory(category_name='Flaring emissions', category_type='basic'),
            EmissionCategory(category_name='Fugitive emissions', category_type='basic'),
            EmissionCategory(category_name='Industrial process emissions', category_type='basic'),
            EmissionCategory(category_name='On-site transportation emissions', category_type='basic'),
            EmissionCategory(category_name='Stationary fuel combustion emissions', category_type='basic'),
            EmissionCategory(category_name='Venting emissions — useful', category_type='basic'),
            EmissionCategory(category_name='Venting emissions — non-useful', category_type='basic'),
            EmissionCategory(category_name='Emissions from waste', category_type='basic'),
            EmissionCategory(category_name='Emissions from wastewater', category_type='basic'),
            # FUEL_EXCLUDED
            EmissionCategory(category_name='CO2 emissions from excluded woody biomass', category_type='fuel_excluded'),
            EmissionCategory(category_name='Other emissions from excluded biomass', category_type='fuel_excluded'),
            EmissionCategory(category_name='Emissions from excluded non-biomass', category_type='fuel_excluded'),
            # OTHER_EXCLUDED
            EmissionCategory(
                category_name='Emissions from line tracing and non-processing and non-compression activities',
                category_type='other_excluded',
            ),
            EmissionCategory(
                category_name='Emissions from fat, oil and grease collection, refining and storage',
                category_type='other_excluded',
            ),
        ]
    )


def reverse_init_emission_category_data(apps, schema_editor):
    EmissionCategory = apps.get_model('reporting', 'EmissionCategory')
    EmissionCategory.objects.all().delete()


def init_product_emission_intensity_data(apps, schema_editor):
    Product = apps.get_model('registration', 'RegulatedProduct')
    ProductEmissionIntensity = apps.get_model('reporting', 'ProductEmissionIntensity')
    ProductEmissionIntensity.objects.bulk_create(
        [
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='BC-specific refinery complexity throughput').id),
                product_weighted_average_emission_intensity='0.0049',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Cement equivalent').id),
                product_weighted_average_emission_intensity='0.6262',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Chemicals: pure hydrogen peroxide').id),
                product_weighted_average_emission_intensity='1.0700',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Compression, centrifugal - consumed energy').id),
                product_weighted_average_emission_intensity='0.4513',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Compression, positive displacement - consumed energy').id),
                product_weighted_average_emission_intensity='0.5547',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Forged steel balls: less than 3.5 inches diameter').id),
                product_weighted_average_emission_intensity='0.1055',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Forged steel balls: greater than 4 inches diameter').id),
                product_weighted_average_emission_intensity='0.1830',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Gypsum wallboard').id),
                product_weighted_average_emission_intensity='0.1183',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Lime at 94.5% CaO and lime kiln dust').id),
                product_weighted_average_emission_intensity='1.0663',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Limestone for sale').id),
                product_weighted_average_emission_intensity='0.0192',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Liquefied natural gas').id),
                product_weighted_average_emission_intensity='0',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Mining: coal').id),
                product_weighted_average_emission_intensity='0.0457',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Mining: copper-equivalent, open pit').id),
                product_weighted_average_emission_intensity='1.6262',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Mining: copper-equivalent, underground').id),
                product_weighted_average_emission_intensity='0.4236',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Mining: gold-equivalent').id),
                product_weighted_average_emission_intensity='3868.9968',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Processing sour gas - oil equivalent').id),
                product_weighted_average_emission_intensity='0.0786',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Processing sweet gas - oil equivalent').id),
                product_weighted_average_emission_intensity='0.0192',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Pulp and paper: chemical pulp').id),
                product_weighted_average_emission_intensity='0.3177',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Pulp and paper: non-chemical pulp').id),
                product_weighted_average_emission_intensity='0.1258',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Pulp and paper: paper (except newsprint and tissue paper)').id),
                product_weighted_average_emission_intensity='0.1129',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Pulp and paper: tissue Paper').id),
                product_weighted_average_emission_intensity='0.2606',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Rendering and meat processing: protein and fat').id),
                product_weighted_average_emission_intensity='0.3862',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Renewable diesel').id),
                product_weighted_average_emission_intensity='0',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Smelting: aluminum').id),
                product_weighted_average_emission_intensity='2.4307',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Smelting: lead-zinc').id),
                product_weighted_average_emission_intensity='1.1622',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Sold electricity').id),
                product_weighted_average_emission_intensity='52.0363',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Sold Heat').id),
                product_weighted_average_emission_intensity='0.0078',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Steel wire: HDG-process (hot dip galvanization)').id),
                product_weighted_average_emission_intensity='0.1736',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Steel wire: Non-HDG').id),
                product_weighted_average_emission_intensity='0.0055',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Sugar: liquid').id),
                product_weighted_average_emission_intensity='0.2593',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Sugar: solid').id),
                product_weighted_average_emission_intensity='0.2369',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: lumber').id),
                product_weighted_average_emission_intensity='0.0196',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: medium density fibreboard (MDF)').id),
                product_weighted_average_emission_intensity='0.0817',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: plywood').id),
                product_weighted_average_emission_intensity='0.0784',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: veneer').id),
                product_weighted_average_emission_intensity='0.0849',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: wood chips (including hog fuel)').id),
                product_weighted_average_emission_intensity='0.0075',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
            ProductEmissionIntensity(
                product_id=(Product.objects.get(name='Wood products: wood pellets').id),
                product_weighted_average_emission_intensity='0.1048',
                valid_from='2023-01-01',
                valid_to='9999-12-31',
            ),
        ]
    )


def reverse_init_product_emission_intensity_data(apps, schema_editor):
    ProductEmissionIntensity = apps.get_model('reporting', 'ProductEmissionIntensity')
    ProductEmissionIntensity.objects.all().delete()


def init_configuration_element_data(apps, schema_editor):
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')

    VALID_FROM = '2023-01-01'
    VALID_TO = '2099-12-31'

    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Fetch all related objects up front — minimises DB round-trips
    activities = {activity.name: activity for activity in Activity.objects.all()}
    source_types = {source_type.name: source_type for source_type in SourceType.objects.all()}
    gas_types = {gas_type.chemical_formula: gas_type for gas_type in GasType.objects.all()}
    methodologies = {methodology.name: methodology for methodology in Methodology.objects.all()}

    # Build a lookup for CustomMethodologySchema by (activity, source_type, gas, methodology)
    custom_schemas = {
        (
            custom_methodology_schema.activity.name,
            custom_methodology_schema.source_type.name,
            custom_methodology_schema.gas_type.chemical_formula,
            custom_methodology_schema.methodology.name,
        ): custom_methodology_schema
        for custom_methodology_schema in CustomMethodologySchema.objects.select_related(
            'activity', 'source_type', 'gas_type', 'methodology'
        ).all()
    }

    # (activity_name, source_type_name, gas_formula, methodology_name)
    CONFIGURATION_ELEMENTS = [
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CO2',
            'Default EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CO2',
            'Site-specific EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CH4',
            'Default EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CH4',
            'Site-specific EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'N2O',
            'Default EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'N2O',
            'Site-specific EF',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CO2',
            'CEMS',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CO2',
            'Measured CC and MW',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Measured EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Measured EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Refinery fuel gas combustion',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Carbonate use',
            'Carbonates used but not consumed in other activities set out in column 2',
            'CO2',
            'Calcination Fraction',
        ),
        (
            'Carbonate use',
            'Carbonates used but not consumed in other activities set out in column 2',
            'CO2',
            'Mass of Output Carbonates',
        ),
        (
            'Carbonate use',
            'Carbonates used but not consumed in other activities set out in column 2',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Carbonate use',
            'Carbonates used but not consumed in other activities set out in column 2',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured CC',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Measured Steam/Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Default HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured HHV/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Measured Steam/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Heat Input/Default EF',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary combustion excluding line tracing',
            'General stationary combustion of waste without production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary combustion solely for the purpose of line tracing',
            'General stationary combustion of fuel or waste with production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'CO2',
            'CEMS',
        ),
        (
            'General stationary non-compression and non-processing combustion',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'CO2',
            'CEMS',
        ),
        (
            'Hydrogen production',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'CO2',
            'CEMS',
        ),
        (
            'Hydrogen production',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Hydrogen production',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'CO2',
            'Replacement Methodology',
        ),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CO2', 'Solids-HHV'),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CO2', 'Solids-CC'),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CO2', 'Make-up Chemical Use Methodology'),
        (
            'Pulp and paper production',
            'Pulping and chemical recovery',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CO2', 'Replacement Methodology'),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CH4', 'Solids-HHV'),
        (
            'Pulp and paper production',
            'Pulping and chemical recovery',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'CH4', 'Replacement Methodology'),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'N2O', 'Solids-HHV'),
        (
            'Pulp and paper production',
            'Pulping and chemical recovery',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Pulp and paper production', 'Pulping and chemical recovery', 'N2O', 'Replacement Methodology'),
        (
            'Open pit coal mining',
            'Coal when broken or exposed to the atmosphere during mining',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Open pit coal mining',
            'Coal when broken or exposed to the atmosphere during mining',
            'CH4',
            'Replacement Methodology',
        ),
        ('Storage of petroleum products', 'Above-ground storage tanks', 'CH4', 'WCI.203(f)(1)'),
        ('Storage of petroleum products', 'Above-ground storage tanks', 'CH4', 'WCI.203(f)(2)'),
        (
            'Storage of petroleum products',
            'Above-ground storage tanks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Storage of petroleum products', 'Above-ground storage tanks', 'CH4', 'Replacement Methodology'),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Anode Consumption - Prebaked',
        ),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Anode Consumption - Soderberg',
        ),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Anode/Cathode Baking',
        ),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Green Coke Calcination',
        ),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Aluminum or alumina production',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'CO2',
            'Replacement Methodology',
        ),
        ('Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method'),
        ('Aluminum or alumina production', 'Anode effects', 'CF4', 'Overvoltage method'),
        ('Aluminum or alumina production', 'Anode effects', 'CF4', 'Alternative Parameter Measurement Methodology'),
        ('Aluminum or alumina production', 'Anode effects', 'CF4', 'Replacement Methodology'),
        ('Aluminum or alumina production', 'Anode effects', 'C2F6', 'C2F6 anode effects'),
        ('Aluminum or alumina production', 'Anode effects', 'C2F6', 'Alternative Parameter Measurement Methodology'),
        ('Aluminum or alumina production', 'Anode effects', 'C2F6', 'Replacement Methodology'),
        ('Aluminum or alumina production', 'Cover gas from electrolysis cells', 'SF6', 'Inventory'),
        ('Aluminum or alumina production', 'Cover gas from electrolysis cells', 'SF6', 'Input/output'),
        (
            'Aluminum or alumina production',
            'Cover gas from electrolysis cells',
            'SF6',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Aluminum or alumina production', 'Cover gas from electrolysis cells', 'SF6', 'Replacement Methodology'),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.353 (a)(1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.353 (a)(1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.353 (a)(2)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.353 (a)(2)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.353 (a.1)(1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.353 (a.1)(1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.353 (a.1)(2)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.353 (a.1)(2)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'WCI.353 (b)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'WCI.353 (b)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'WCI.353 (b.1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'WCI.353 (b.1)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CO2',
            'WCI.353 (c)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CH4',
            'WCI.353 (c)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Blowdown venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CO2',
            'WCI.353 (d)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CH4',
            'WCI.353 (d)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'N2O',
            'WCI.353 (d)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Flare stacks',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'WCI.353 (g)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'WCI.353 (g)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CO2',
            'WCI.353 (h)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CH4',
            'WCI.353 (h)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Population count sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CO2',
            'WCI.353 (m)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CH4',
            'WCI.353 (m)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Transmission storage tanks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CO2',
            'Other CGA Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CH4',
            'Other CGA Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other venting sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CO2',
            'Other CGA Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CH4',
            'Other CGA Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Other fugitive sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.353 (c.1)(i)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.353 (c.1)(i)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.353 (c.1)(ii)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.353 (c.1)(ii)',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'Third party line hits with release of gas',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.353 (a)(1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.353 (a)(1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.353 (a)(2)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.353 (a)(2)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.353 (a.1)(1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.353 (a.1)(1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.353 (a.1)(2)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.353 (a.1)(2)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'WCI.353 (b)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'WCI.353 (b)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'WCI.353 (b.1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'WCI.353 (b.1)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'WCI.353 (c)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'WCI.353 (c)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CO2',
            'WCI.353 (d)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CH4',
            'WCI.353 (d)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'N2O',
            'WCI.353 (d)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Flare stacks',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'WCI.353 (e)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'WCI.353 (e)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'WCI.353 (f)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'WCI.353 (f)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'WCI.353 (g)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'WCI.353 (g)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CO2',
            'WCI.353 (h)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CH4',
            'WCI.353 (h)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Population count sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'WCI.353 (m)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'WCI.353 (m)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Other CGA Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Other CGA Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Other CGA Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Other CGA Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.353 (c.1)(i)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.353 (c.1)(i)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.353 (c.1)(ii)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.353 (c.1)(ii)',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Replacement Methodology',
        ),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CO2', 'WCI.353 (a)(1)'),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CH4', 'WCI.353 (a)(1)'),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CO2', 'WCI.353 (a)(2)'),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CH4', 'WCI.353 (a)(2)'),
        (
            'LNG activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic high bleed device venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CO2', 'WCI.353 (a.1)(1)'),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CH4', 'WCI.353 (a.1)(1)'),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CO2', 'WCI.353 (a.1)(2)'),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CH4', 'WCI.353 (a.1)(2)'),
        (
            'LNG activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic pump venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic low bleed device venting', 'CO2', 'WCI.353 (b)'),
        ('LNG activities', 'Natural gas pneumatic low bleed device venting', 'CH4', 'WCI.353 (b)'),
        (
            'LNG activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Natural gas pneumatic low bleed device venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic low bleed device venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic intermittent bleed device venting', 'CO2', 'WCI.353 (b.1)'),
        ('LNG activities', 'Natural gas pneumatic intermittent bleed device venting', 'CH4', 'WCI.353 (b.1)'),
        (
            'LNG activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Natural gas pneumatic intermittent bleed device venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Natural gas pneumatic intermittent bleed device venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Acid gas removal venting or incineration', 'CO2', 'WCI.363 (c)'),
        (
            'LNG activities',
            'Acid gas removal venting or incineration',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Acid gas removal venting or incineration', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Dehydrator venting', 'CO2', 'WCI.363 (d)'),
        ('LNG activities', 'Dehydrator venting', 'CH4', 'WCI.363 (d)'),
        ('LNG activities', 'Dehydrator venting', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Dehydrator venting', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Dehydrator venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Dehydrator venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Blowdown venting', 'CO2', 'WCI.353 (c)'),
        ('LNG activities', 'Blowdown venting', 'CH4', 'WCI.353 (c)'),
        ('LNG activities', 'Blowdown venting', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Blowdown venting', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Blowdown venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Blowdown venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CO2', 'WCI.363 (h)(1)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CH4', 'WCI.363 (h)(1)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CO2', 'WCI.363 (h)(2)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CH4', 'WCI.363 (h)(2)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CO2', 'WCI.363 (h)(3)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CH4', 'WCI.363 (h)(3)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CO2', 'WCI.363 (h)(4)'),
        ('LNG activities', 'Releases from tanks used for storage, production or processing', 'CH4', 'WCI.363 (h)(4)'),
        (
            'LNG activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'LNG activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Replacement Methodology',
        ),
        ('LNG activities', 'Flare stacks', 'CO2', 'WCI.353 (d)'),
        ('LNG activities', 'Flare stacks', 'CH4', 'WCI.353 (d)'),
        ('LNG activities', 'Flare stacks', 'N2O', 'WCI.353 (d)'),
        ('LNG activities', 'Flare stacks', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Flare stacks', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Flare stacks', 'N2O', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Flare stacks', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Flare stacks', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Flare stacks', 'N2O', 'Replacement Methodology'),
        ('LNG activities', 'Centrifugal compressor venting', 'CO2', 'WCI.353 (e)'),
        ('LNG activities', 'Centrifugal compressor venting', 'CH4', 'WCI.353 (e)'),
        ('LNG activities', 'Centrifugal compressor venting', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Centrifugal compressor venting', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Centrifugal compressor venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Centrifugal compressor venting', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Reciprocating compressor venting', 'CO2', 'WCI.353 (f)'),
        ('LNG activities', 'Reciprocating compressor venting', 'CH4', 'WCI.353 (f)'),
        ('LNG activities', 'Reciprocating compressor venting', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Reciprocating compressor venting', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Reciprocating compressor venting', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Reciprocating compressor venting', 'CH4', 'Replacement Methodology'),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'WCI.353 (g)',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'WCI.353 (g)',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'CEPEI Methodology Manual',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'CEPEI Methodology Manual',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'LNG activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Replacement Methodology',
        ),
        ('LNG activities', 'Population count sources', 'CO2', 'WCI.353 (h)'),
        ('LNG activities', 'Population count sources', 'CH4', 'WCI.353 (h)'),
        ('LNG activities', 'Population count sources', 'CO2', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Population count sources', 'CH4', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Population count sources', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Population count sources', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Population count sources', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Population count sources', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Transmission storage tanks', 'CO2', 'WCI.353 (m)'),
        ('LNG activities', 'Transmission storage tanks', 'CH4', 'WCI.353 (m)'),
        ('LNG activities', 'Transmission storage tanks', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Transmission storage tanks', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Transmission storage tanks', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Transmission storage tanks', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Enhanced oil recovery injection pump blowdowns', 'CO2', 'WCI.363 (t)'),
        (
            'LNG activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Enhanced oil recovery injection pump blowdowns', 'CO2', 'Replacement Methodology'),
        (
            'LNG activities',
            'Produced water dissolved carbon dioxide and methane',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Produced water dissolved carbon dioxide and methane',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Produced water dissolved carbon dioxide and methane', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Produced water dissolved carbon dioxide and methane', 'CH4', 'Replacement Methodology'),
        (
            'LNG activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Replacement Methodology',
        ),
        ('LNG activities', 'Other venting sources', 'CO2', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Other venting sources', 'CH4', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Other venting sources', 'CO2', 'Other CGA Methodology'),
        ('LNG activities', 'Other venting sources', 'CH4', 'Other CGA Methodology'),
        ('LNG activities', 'Other venting sources', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Other venting sources', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Other venting sources', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Other venting sources', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CO2', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Other fugitive sources', 'CH4', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Other fugitive sources', 'CO2', 'Other CGA Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CH4', 'Other CGA Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Other fugitive sources', 'CH4', 'Replacement Methodology'),
        ('LNG activities', 'Third party line hits with release of gas', 'CO2', 'WCI.353 (c.1)(i)'),
        ('LNG activities', 'Third party line hits with release of gas', 'CH4', 'WCI.353 (c.1)(i)'),
        ('LNG activities', 'Third party line hits with release of gas', 'CO2', 'WCI.353 (c.1)(ii)'),
        ('LNG activities', 'Third party line hits with release of gas', 'CH4', 'WCI.353 (c.1)(ii)'),
        ('LNG activities', 'Third party line hits with release of gas', 'CO2', 'CEPEI Methodology Manual'),
        ('LNG activities', 'Third party line hits with release of gas', 'CH4', 'CEPEI Methodology Manual'),
        (
            'LNG activities',
            'Third party line hits with release of gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'LNG activities',
            'Third party line hits with release of gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('LNG activities', 'Third party line hits with release of gas', 'CO2', 'Replacement Methodology'),
        ('LNG activities', 'Third party line hits with release of gas', 'CH4', 'Replacement Methodology'),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.363 (a)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.363 (a)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.363 (a.1)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.363 (a.1)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'WCI.363 (b)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'WCI.363 (b)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'WCI.363 (b.1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'WCI.363 (b.1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CO2',
            'WCI.363 (d)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CH4',
            'WCI.363 (d)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Dehydrator venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CO2',
            'WCI.363 (e)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CH4',
            'WCI.363 (e)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well venting for liquids unloading',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CO2',
            'WCI.363 (f)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CO2',
            'WCI.363 (f)(2)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CH4',
            'WCI.363 (f)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CH4',
            'WCI.363 (f)(2)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CO2',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CH4',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'N2O',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling flaring',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CO2',
            'WCI.363 (o)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CO2',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CH4',
            'WCI.363 (o)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CH4',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Drilling venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CO2',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CH4',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'N2O',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Hydraulic fracturing flaring',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CO2',
            'WCI.363 (g)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CH4',
            'WCI.363 (g)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Blowdown venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(2)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(3)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(4)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(2)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(3)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(4)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CO2',
            'WCI.363 (i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CH4',
            'WCI.363 (i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CO2',
            'WCI.363 (i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CH4',
            'WCI.363 (i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'N2O',
            'WCI.363 (i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Well testing flaring',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CO2',
            'WCI.363 (j)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CH4',
            'WCI.363 (j)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CO2',
            'WCI.363 (j)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CH4',
            'WCI.363 (j)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'N2O',
            'WCI.363 (j)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Associated gas flaring',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CO2',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CH4',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'N2O',
            'WCI.363 (k)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Flaring stacks',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'WCI.363 (n)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'WCI.363 (n)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CO2',
            'WCI.363 (o)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CH4',
            'WCI.363 (o)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Population count sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CO2',
            'WCI.363 (h.1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CH4',
            'WCI.363 (h.1)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Transmission storage tanks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'WCI.363 (t)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CO2',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CH4',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other venting sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CO2',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CH4',
            'Other Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Other fugitive sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.363 (g.1)(i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.363 (g.1)(ii)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.363 (g.1)(i)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.363 (g.1)(ii)',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'WCI.363 (a)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'WCI.363 (a)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic high bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'WCI.363 (a.1)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'WCI.363 (a.1)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic pump venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'WCI.363 (b)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'WCI.363 (b)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic low bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'WCI.363 (b.1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'WCI.363 (b.1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Natural gas pneumatic intermittent bleed device venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Acid gas removal venting or incineration',
            'CO2',
            'WCI.363 (c)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Acid gas removal venting or incineration',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Acid gas removal venting or incineration',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CO2',
            'WCI.363 (d)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CH4',
            'WCI.363 (d)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Dehydrator venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'WCI.363 (g)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'WCI.363 (g)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Blowdown venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(2)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(2)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(3)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(3)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'WCI.363 (h)(4)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'WCI.363 (h)(4)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Releases from tanks used for storage, production or processing',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CO2',
            'WCI.363 (j)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CH4',
            'WCI.363 (j)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CO2',
            'WCI.363 (j)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CH4',
            'WCI.363 (j)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'N2O',
            'WCI.363 (j)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Associated gas flaring',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CO2',
            'WCI.363 (k)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CH4',
            'WCI.363 (k)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'N2O',
            'WCI.363 (k)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Flaring stacks',
            'N2O',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'WCI.363 (l)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'WCI.363 (l)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Centrifugal compressor venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'WCI.363 (m)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'WCI.363 (m)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Reciprocating compressor venting',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'WCI.363 (n)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'WCI.363 (n)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CO2',
            'WCI.363 (o)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CH4',
            'WCI.363 (o)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Population count sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'WCI.363 (h.1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'WCI.363 (h.1)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Transmission storage tanks',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'WCI.363 (t)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Enhanced oil recovery injection pump blowdowns',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Produced water dissolved carbon dioxide and methane',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Other Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Other Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other venting sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            '2009 API Compendium',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Other Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Other Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Other fugitive sources',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.363 (g.1)(i)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.363 (g.1)(i)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'WCI.363 (g.1)(ii)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'WCI.363 (g.1)(ii)',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'Third party line hits with release of gas',
            'CH4',
            'Replacement Methodology',
        ),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'CEMS'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Measured CC and MW'),
        (
            'Electricity generation',
            'Fuel combustion for electricity generation',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Replacement Methodology'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Default HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Measured HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Measured EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Measured Steam/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Heat Input/Default EF'),
        (
            'Electricity generation',
            'Fuel combustion for electricity generation',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CH4', 'Replacement Methodology'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Default HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Measured HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Measured EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Measured Steam/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Heat Input/Default EF'),
        (
            'Electricity generation',
            'Fuel combustion for electricity generation',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'N2O', 'Replacement Methodology'),
        ('Electricity generation', 'Acid gas scrubbers and acid gas reagents', 'CO2', 'Acid gas'),
        (
            'Electricity generation',
            'Acid gas scrubbers and acid gas reagents',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Acid gas scrubbers and acid gas reagents', 'CO2', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-23 (CHF3)', 'Mass balance'),
        ('Electricity generation', 'Cooling units', 'HFC-23 (CHF3)', 'Alternative Parameter Measurement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-23 (CHF3)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-32 (CH2F2)', 'Mass balance'),
        ('Electricity generation', 'Cooling units', 'HFC-32 (CH2F2)', 'Alternative Parameter Measurement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-32 (CH2F2)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-41 (CH3F)', 'Mass balance'),
        ('Electricity generation', 'Cooling units', 'HFC-41 (CH3F)', 'Alternative Parameter Measurement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-41 (CH3F)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-43-10mee (C5H2F10)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-43-10mee (C5H2F10)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-43-10mee (C5H2F10)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-125 (C2HF5)', 'Mass balance'),
        ('Electricity generation', 'Cooling units', 'HFC-125 (C2HF5)', 'Alternative Parameter Measurement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-125 (C2HF5)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-134 (C2H2F4)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-134 (C2H2F4)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-134 (C2H2F4)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-134a (C2H2F4)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-134a (C2H2F4)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-134a (C2H2F4)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-143 (C2H3F3)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-143 (C2H3F3)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-143 (C2H3F3)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-143a (C2H3F3)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-143a (C2H3F3)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-143a (C2H3F3)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-152a (C2H4F2)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-152a (C2H4F2)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-152a (C2H4F2)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-227ea (C3HF7)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-227ea (C3HF7)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-227ea (C3HF7)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-236fa (C3H2F6)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-236fa (C3H2F6)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-236fa (C3H2F6)', 'Replacement Methodology'),
        ('Electricity generation', 'Cooling units', 'HFC-245ca (C3H3F5)', 'Mass balance'),
        (
            'Electricity generation',
            'Cooling units',
            'HFC-245ca (C3H3F5)',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Cooling units', 'HFC-245ca (C3H3F5)', 'Replacement Methodology'),
        ('Electricity generation', 'Geothermal geyser steam or fluids', 'CO2', 'Measured heat'),
        (
            'Electricity generation',
            'Geothermal geyser steam or fluids',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Electricity generation', 'Geothermal geyser steam or fluids', 'CO2', 'Replacement Methodology'),
        (
            'Electricity generation',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Mass balance',
        ),
        (
            'Electricity generation',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Direct measurement',
        ),
        (
            'Electricity generation',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity generation',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Replacement Methodology',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'CH4',
            'Chemical Oxygen Demand',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'CH4',
            'Biochemical Oxygen Demand',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'N2O',
            'Nitrogen in effluent',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Industrial wastewater processing',
            'Industrial wastewater process using anaerobic digestion',
            'N2O',
            'Replacement Methodology',
        ),
        ('Industrial wastewater processing', 'Oil-water separators', 'CH4', 'Default conversion factor'),
        ('Industrial wastewater processing', 'Oil-water separators', 'CH4', 'Measured conversion factor'),
        (
            'Industrial wastewater processing',
            'Oil-water separators',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Industrial wastewater processing', 'Oil-water separators', 'CH4', 'Replacement Methodology'),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'CO2',
            'CEMS',
        ),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'CO2',
            'Oxidation Emissions',
        ),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'CO2',
            'Replacement Methodology',
        ),
        ('Lime manufacturing', 'Calcination of carbonate materials in lime manufacturing', 'CO2', 'CEMS'),
        (
            'Lime manufacturing',
            'Calcination of carbonate materials in lime manufacturing',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Lime manufacturing',
            'Calcination of carbonate materials in lime manufacturing',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Coal storage at facilities that combust coal',
            'Stored coal piles',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Coal storage at facilities that combust coal', 'Stored coal piles', 'CH4', 'Replacement Methodology'),
        ('Zinc production', 'Use of reducing agents during zinc production', 'CO2', 'CEMS'),
        (
            'Zinc production',
            'Use of reducing agents during zinc production',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Zinc production', 'Use of reducing agents during zinc production', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Catalyst regeneration', 'CO2', 'WCI.203(a)(1)'),
        ('Petroleum refining', 'Catalyst regeneration', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'CH4', 'WCI.203(a)(2)'),
        ('Petroleum refining', 'Catalyst regeneration', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'N2O', 'WCI.203(a)(3)'),
        ('Petroleum refining', 'Catalyst regeneration', 'N2O', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Catalyst regeneration', 'N2O', 'Replacement Methodology'),
        ('Petroleum refining', 'Process vents', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Process vents', 'CO2', 'WCI.203(b)'),
        ('Petroleum refining', 'Process vents', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Process vents', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Process vents', 'CH4', 'WCI.203(b)'),
        ('Petroleum refining', 'Process vents', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Process vents', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Process vents', 'N2O', 'WCI.203(b)'),
        ('Petroleum refining', 'Process vents', 'N2O', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Process vents', 'N2O', 'Replacement Methodology'),
        ('Petroleum refining', 'Asphalt production', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Asphalt production', 'CO2', 'WCI.203(c)'),
        ('Petroleum refining', 'Asphalt production', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Asphalt production', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Asphalt production', 'CH4', 'WCI.203(c)'),
        ('Petroleum refining', 'Asphalt production', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Asphalt production', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Sulphur recovery', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Sulphur recovery', 'CO2', 'WCI.203(d)'),
        ('Petroleum refining', 'Sulphur recovery', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Sulphur recovery', 'CO2', 'Replacement Methodology'),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'WCI.203(e)(1)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'WCI.203(e)(2)(A)(i)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'WCI.203(e)(2)(A)(ii)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'WCI.203(e)(B)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CO2',
            'Replacement Methodology',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CH4',
            'WCI.203(e)(1)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CH4',
            'WCI.203(e)(3)(A)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'N2O',
            'WCI.203(e)(1)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'N2O',
            'WCI.203(e)(3)(B)',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Petroleum refining',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'N2O',
            'Replacement Methodology',
        ),
        ('Petroleum refining', 'Above-ground storage tanks at refineries', 'CH4', 'WCI.203(f)(1)'),
        ('Petroleum refining', 'Above-ground storage tanks at refineries', 'CH4', 'WCI.203(f)(2)'),
        (
            'Petroleum refining',
            'Above-ground storage tanks at refineries',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Above-ground storage tanks at refineries', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Oil-water separators at refineries', 'CH4', 'Default conversion factor'),
        ('Petroleum refining', 'Oil-water separators at refineries', 'CH4', 'Measured conversion factor'),
        (
            'Petroleum refining',
            'Oil-water separators at refineries',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Oil-water separators at refineries', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Equipment leaks at refineries', 'CH4', 'WCI.203(i)(1)'),
        ('Petroleum refining', 'Equipment leaks at refineries', 'CH4', 'WCI.203(i)(2)'),
        ('Petroleum refining', 'Equipment leaks at refineries', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Equipment leaks at refineries', 'CH4', 'Replacement Methodology'),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'CH4',
            'Chemical Oxygen Demand',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'CH4',
            'Biochemical Oxygen Demand',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'CH4',
            'Replacement Methodology',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'N2O',
            'Nitrogen in effluent',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Petroleum refining',
            'Wastewater processing using anaerobic digestion at refineries',
            'N2O',
            'Replacement Methodology',
        ),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'CO2', 'WCI.203(b)'),
        (
            'Petroleum refining',
            'Uncontrolled blowdown systems used at refineries',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'CH4', 'WCI.203(b)'),
        (
            'Petroleum refining',
            'Uncontrolled blowdown systems used at refineries',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'N2O', 'WCI.203(b)'),
        (
            'Petroleum refining',
            'Uncontrolled blowdown systems used at refineries',
            'N2O',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Uncontrolled blowdown systems used at refineries', 'N2O', 'Replacement Methodology'),
        ('Petroleum refining', 'Loading operations at refineries and terminals', 'CH4', 'WCI.203(l)'),
        (
            'Petroleum refining',
            'Loading operations at refineries and terminals',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Loading operations at refineries and terminals', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Delayed coking units at refineries', 'CH4', 'WCI.203(m)(1)'),
        ('Petroleum refining', 'Delayed coking units at refineries', 'CH4', 'WCI.203(m)(2)'),
        (
            'Petroleum refining',
            'Delayed coking units at refineries',
            'CH4',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Petroleum refining', 'Delayed coking units at refineries', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CO2', 'CEMS'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CO2', 'WCI.203(j)(2)'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CO2', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CO2', 'Replacement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CH4', 'Default emission factor'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CH4', 'Measured emission factor'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CH4', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'CH4', 'Replacement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'N2O', 'Default emission factor'),
        ('Petroleum refining', 'Coke calcining at refineries', 'N2O', 'Measured emission factor'),
        ('Petroleum refining', 'Coke calcining at refineries', 'N2O', 'Alternative Parameter Measurement Methodology'),
        ('Petroleum refining', 'Coke calcining at refineries', 'N2O', 'Replacement Methodology'),
        ('Lead production', 'Use of reducing agents during lead production', 'CO2', 'CEMS'),
        (
            'Lead production',
            'Use of reducing agents during lead production',
            'CO2',
            'Alternative Parameter Measurement Methodology',
        ),
        ('Lead production', 'Use of reducing agents during lead production', 'CO2', 'Replacement Methodology'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Default HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Measured HHV/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Measured Steam/Default EF'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Measured CC'),
        ('Electricity generation', 'Fuel combustion for electricity generation', 'CO2', 'Measured Steam/Measured EF'),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'CF4',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C2F6',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C3F8',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C4F10',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'c-C4F8',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C5F12',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C6F14',
            'Mass balance',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'CF4',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C2F6',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C3F8',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C4F10',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'c-C4F8',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C5F12',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C6F14',
            'Direct measurement',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'CF4',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C2F6',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C3F8',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C4F10',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'c-C4F8',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C5F12',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C6F14',
            'Alternative Parameter Measurement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'SF6',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'CF4',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C2F6',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C3F8',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C4F10',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'c-C4F8',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C5F12',
            'Replacement Methodology',
        ),
        (
            'Electricity transmission',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'C6F14',
            'Replacement Methodology',
        ),
    ]

    # ConfigurationElement records that require a CustomMethodologySchema FK.
    CUSTOM_SCHEMA_ELEMENTS = [
        (
            'Hydrogen production',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'CO2',
            'Feedstock Material Balance',
        ),
        (
            'Open pit coal mining',
            'Coal when broken or exposed to the atmosphere during mining',
            'CH4',
            'Emissions Factor Methodology',
        ),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'CO2',
            'Calcination Emissions',
        ),
        ('Lime manufacturing', 'Calcination of carbonate materials in lime manufacturing', 'CO2', 'Calculated'),
        ('Coal storage at facilities that combust coal', 'Stored coal piles', 'CH4', 'Default EF'),
        ('Zinc production', 'Use of reducing agents during zinc production', 'CO2', 'Measured CC'),
        ('Lead production', 'Use of reducing agents during lead production', 'CO2', 'Measured CC'),
    ]

    # Standard ConfigurationElements
    ConfigurationElement.objects.bulk_create(
        [
            ConfigurationElement(
                activity=activities[activity],
                source_type=source_types[source_type],
                gas_type=gas_types[gas_type],
                methodology=methodologies[methodology],
                valid_from=valid_from,
                valid_to=valid_to,
            )
            for activity, source_type, gas_type, methodology in CONFIGURATION_ELEMENTS
        ]
    )

    # ConfigurationElements that reference a CustomMethodologySchema
    ConfigurationElement.objects.bulk_create(
        [
            ConfigurationElement(
                activity=activities[activity],
                source_type=source_types[source_type],
                gas_type=gas_types[gas_type],
                methodology=methodologies[methodology],
                custom_methodology_schema=custom_schemas[(activity, source_type, gas_type, methodology)],
                valid_from=valid_from,
                valid_to=valid_to,
            )
            for activity, source_type, gas_type, methodology in CUSTOM_SCHEMA_ELEMENTS
        ]
    )


def reverse_init_configuration_element_data(apps, schema_editor):
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.all().delete()


def init_configuration_element_reporting_fields_data(apps, schema_editor):
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ReportingField = apps.get_model('reporting', 'ReportingField')

    valid_from = Configuration.objects.get(valid_from='2023-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')

    def get_field(field_name, field_units=None):
        if field_units is None:
            try:
                return ReportingField.objects.get(field_name=field_name, field_units__isnull=True)
            except ReportingField.DoesNotExist:
                # Squashed migration: field may already have units from final state
                return ReportingField.objects.get(field_name=field_name)
        return ReportingField.objects.get(field_name=field_name, field_units=field_units)

    def add_field(activity_name, source_type_name, gas_formula, methodology_name, field_name, field_units=None):
        ConfigurationElement.objects.get(
            activity=Activity.objects.get(name=activity_name),
            source_type=SourceType.objects.get(name=source_type_name),
            gas_type=GasType.objects.get(chemical_formula=gas_formula),
            methodology=Methodology.objects.get(name=methodology_name),
            valid_from=valid_from,
            valid_to=valid_to,
        ).reporting_fields.add(get_field(field_name, field_units))

    def add_combustion_co2_fields(activity_name, source_type_name):
        add_field(activity_name, source_type_name, 'CO2', 'Default HHV/Default EF', 'Fuel Default High Heating Value')
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Default HHV/Default EF',
            'Unit-Fuel-CO2 Default HHV-Default EF',
            'kg/GJ',
        )
        add_field(activity_name, source_type_name, 'CO2', 'Default EF', 'Unit-Fuel-CO2 Default EF', 'kg/fuel units')
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Measured HHV/Default EF',
            'Fuel Annual Weighted Average High Heating Value',
        )
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Measured HHV/Default EF',
            'Unit-Fuel-CO2 Measured HHV-Default EF',
            'kg/GJ',
        )
        add_field(
            activity_name, source_type_name, 'CO2', 'Measured Steam/Default EF', 'Unit-Fuel Annual Steam Generated'
        )
        add_field(activity_name, source_type_name, 'CO2', 'Measured Steam/Default EF', 'Boiler Ratio')
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Measured Steam/Default EF',
            'Unit-Fuel-CO2 Measured Steam-Default EF',
            'kg/GJ',
        )
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Measured CC',
            'Fuel Annual Weighted Average Carbon Content (weight fraction)',
        )
        add_field(
            activity_name, source_type_name, 'CO2', 'Measured Steam/Measured EF', 'Unit-Fuel Annual Steam Generated'
        )
        add_field(
            activity_name,
            source_type_name,
            'CO2',
            'Measured Steam/Measured EF',
            'Unit-Fuel-CO2 Measured Steam-Measured EF',
            'kg/fuel units',
        )
        add_field(
            activity_name, source_type_name, 'CO2', 'Alternative Parameter Measurement Methodology', 'Description'
        )
        add_field(activity_name, source_type_name, 'CO2', 'Replacement Methodology', 'Description')

    def add_combustion_ch4_fields(activity_name, source_type_name):
        add_field(activity_name, source_type_name, 'CH4', 'Default HHV/Default EF', 'Fuel Default High Heating Value')
        add_field(
            activity_name,
            source_type_name,
            'CH4',
            'Default HHV/Default EF',
            'Unit-Fuel-CH4 Default HHV-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'CH4', 'Default EF', 'Unit-Fuel-CH4 Default EF', 'g/fuel units')
        add_field(
            activity_name,
            source_type_name,
            'CH4',
            'Measured HHV/Default EF',
            'Fuel Annual Weighted Average High Heating Value',
        )
        add_field(
            activity_name,
            source_type_name,
            'CH4',
            'Measured HHV/Default EF',
            'Unit-Fuel-CH4 Measured HHV-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'CH4', 'Measured EF', 'Unit-Fuel-CH4 Measured EF', 'g/fuel units')
        add_field(
            activity_name, source_type_name, 'CH4', 'Measured Steam/Default EF', 'Unit-Fuel Annual Steam Generated'
        )
        add_field(activity_name, source_type_name, 'CH4', 'Measured Steam/Default EF', 'Boiler Ratio')
        add_field(
            activity_name,
            source_type_name,
            'CH4',
            'Measured Steam/Default EF',
            'Unit-Fuel-CH4 Measured Steam-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'CH4', 'Heat Input/Default EF', 'Unit-Fuel Heat Input')
        add_field(
            activity_name,
            source_type_name,
            'CH4',
            'Heat Input/Default EF',
            'Unit-Fuel-CH4 Heat Input-Default EF',
            'g/GJ',
        )
        add_field(
            activity_name, source_type_name, 'CH4', 'Alternative Parameter Measurement Methodology', 'Description'
        )
        add_field(activity_name, source_type_name, 'CH4', 'Replacement Methodology', 'Description')

    def add_combustion_n2o_fields(activity_name, source_type_name):
        add_field(activity_name, source_type_name, 'N2O', 'Default HHV/Default EF', 'Fuel Default High Heating Value')
        add_field(
            activity_name,
            source_type_name,
            'N2O',
            'Default HHV/Default EF',
            'Unit-Fuel-N2O Default HHV-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'N2O', 'Default EF', 'Unit-Fuel-N2O Default EF', 'g/fuel units')
        add_field(
            activity_name,
            source_type_name,
            'N2O',
            'Measured HHV/Default EF',
            'Fuel Annual Weighted Average High Heating Value',
        )
        add_field(
            activity_name,
            source_type_name,
            'N2O',
            'Measured HHV/Default EF',
            'Unit-Fuel-N2O Measured HHV-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'N2O', 'Measured EF', 'Unit-Fuel-N2O Measured EF', 'g/fuel units')
        add_field(
            activity_name, source_type_name, 'N2O', 'Measured Steam/Default EF', 'Unit-Fuel Annual Steam Generated'
        )
        add_field(activity_name, source_type_name, 'N2O', 'Measured Steam/Default EF', 'Boiler Ratio')
        add_field(
            activity_name,
            source_type_name,
            'N2O',
            'Measured Steam/Default EF',
            'Unit-Fuel-N2O Measured Steam-Default EF',
            'g/GJ',
        )
        add_field(activity_name, source_type_name, 'N2O', 'Heat Input/Default EF', 'Unit-Fuel Heat Input')
        add_field(
            activity_name,
            source_type_name,
            'N2O',
            'Heat Input/Default EF',
            'Unit-Fuel-N2O Heat Input-Default EF',
            'g/GJ',
        )
        add_field(
            activity_name, source_type_name, 'N2O', 'Alternative Parameter Measurement Methodology', 'Description'
        )
        add_field(activity_name, source_type_name, 'N2O', 'Replacement Methodology', 'Description')

    def add_combustion_fields(activity_name, source_type_name):
        add_combustion_co2_fields(activity_name, source_type_name)
        add_combustion_ch4_fields(activity_name, source_type_name)
        add_combustion_n2o_fields(activity_name, source_type_name)

    # ── Activity: General stationary combustion excluding line tracing ──────────────────────────────
    for source_type in [
        'General stationary combustion of fuel or waste with production of useful energy',
        'General stationary combustion of waste without production of useful energy',
    ]:
        add_combustion_fields('General stationary combustion excluding line tracing', source_type)

    # ── Activity: General stationary combustion solely for the purpose of line tracing ──────────────
    add_combustion_fields(
        'General stationary combustion solely for the purpose of line tracing',
        'General stationary combustion of fuel or waste with production of useful energy',
    )

    # ── Activity: Fuel combustion by mobile equipment ────────────────────────────────────────────────
    for gas, ef_field, site_field in [
        ('CO2', 'Unit-Fuel-CO2 Default EF', 'Unit-Fuel-CO2 Site-specific EF'),
        ('CH4', 'Unit-Fuel-CH4 Default EF', 'Unit-Fuel-CH4 Site-specific EF'),
        ('N2O', 'Unit-Fuel-N2O Default EF', 'Unit-Fuel-N2O Site-specific EF'),
    ]:
        units = 'kg/fuel units' if gas == 'CO2' else 'g/fuel units'
        add_field(
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            gas,
            'Default EF',
            ef_field,
            units,
        )
        add_field(
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            gas,
            'Site-specific EF',
            site_field,
            units,
        )
        add_field(
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            gas,
            'Alternative Parameter Measurement Methodology',
            'Description',
        )
        add_field(
            'Fuel combustion by mobile equipment',
            'Fuel combustion by mobile equipment that is part of the facility',
            gas,
            'Replacement Methodology',
            'Description',
        )

    # ── Activity: General stationary combustion, other than non-compression and non-processing combustion ──
    for source_type in [
        'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
        'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
        'Field gas or process vent gas combustion at a linear facilities operation',
    ]:
        add_combustion_fields(
            'General stationary combustion, other than non-compression and non-processing combustion', source_type
        )

    # ── Activity: Refinery fuel gas combustion ───────────────────────────────────────────────────────
    add_field(
        'Refinery fuel gas combustion',
        'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
        'CO2',
        'Measured CC and MW',
        'Annual Weighted Average Carbon Content',
    )
    add_field(
        'Refinery fuel gas combustion',
        'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
        'CO2',
        'Measured CC and MW',
        'Annual Weighted Average Molecular Weight',
    )
    add_field(
        'Refinery fuel gas combustion',
        'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
        'CO2',
        'Measured CC and MW',
        'Molar Volume Conversion Factor',
    )
    add_field(
        'Refinery fuel gas combustion',
        'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Refinery fuel gas combustion',
        'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
        'CO2',
        'Replacement Methodology',
        'Description',
    )
    add_combustion_ch4_fields(
        'Refinery fuel gas combustion', 'Combustion of refinery fuel gas, still gas, flexigas or associated gas'
    )
    add_combustion_n2o_fields(
        'Refinery fuel gas combustion', 'Combustion of refinery fuel gas, still gas, flexigas or associated gas'
    )

    # ── Activity: Carbonate use ──────────────────────────────────────────────────────────────────────
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Calcination Fraction',
        'Annual mass of carbonate type consumed (tonnes)',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Calcination Fraction',
        'Fraction calcination achieved for each particular carbonate type (Weight factor)',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Calcination Fraction',
        'Number of carbonate types',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Mass of Output Carbonates',
        'Annual mass of input carbonate type (tonnes)',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Mass of Output Carbonates',
        'Annual mass of output carbonate type (tonnes)',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Mass of Output Carbonates',
        'Number of input carbonate types',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Mass of Output Carbonates',
        'Number of output carbonate types',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Carbonate use',
        'Carbonates used but not consumed in other activities set out in column 2',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: General stationary non-compression and non-processing combustion ──────────────────
    for source_type in [
        'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
        'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
        'Field gas or process vent gas combustion at a linear facilities operation',
    ]:
        add_combustion_fields('General stationary non-compression and non-processing combustion', source_type)

    # ── Activity: Hydrogen production ────────────────────────────────────────────────────────────────
    add_field(
        'Hydrogen production',
        'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Hydrogen production',
        'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Pulp and paper production ──────────────────────────────────────────────────────────
    # CO2
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-HHV',
        'Mass of spent liquor combusted (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-HHV',
        'Solids percentage by weight (%)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-HHV',
        'Annual high heat value of spent liquor solids (GJ/kg)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-CC',
        'Mass of spent liquor combusted (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-CC',
        'Solids percentage by weight (%)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Solids-CC',
        'Annual carbon content of spent liquor solids (% by weight)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Make-up Chemical Use Methodology',
        'Make-up quantity of CaCO3 used (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Make-up Chemical Use Methodology',
        'Make-up quantity of Na2CO3 used (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Is Woody Biomass',
    )
    add_field(
        'Pulp and paper production', 'Pulping and chemical recovery', 'CO2', 'Replacement Methodology', 'Description'
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CO2',
        'Replacement Methodology',
        'Is Woody Biomass',
    )
    # CH4
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Solids-HHV',
        'Mass of spent liquor combusted (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Solids-HHV',
        'Solids percentage by weight (%)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Solids-HHV',
        'Annual high heat value of spent liquor solids (GJ/kg)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Is Woody Biomass',
    )
    add_field(
        'Pulp and paper production', 'Pulping and chemical recovery', 'CH4', 'Replacement Methodology', 'Description'
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'CH4',
        'Replacement Methodology',
        'Is Woody Biomass',
    )
    # N2O
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Solids-HHV',
        'Mass of spent liquor combusted (tonnes/year)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Solids-HHV',
        'Solids percentage by weight (%)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Solids-HHV',
        'Annual high heat value of spent liquor solids (GJ/kg)',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Alternative Parameter Measurement Methodology',
        'Is Woody Biomass',
    )
    add_field(
        'Pulp and paper production', 'Pulping and chemical recovery', 'N2O', 'Replacement Methodology', 'Description'
    )
    add_field(
        'Pulp and paper production',
        'Pulping and chemical recovery',
        'N2O',
        'Replacement Methodology',
        'Is Woody Biomass',
    )

    # ── Activity: Open pit coal mining ───────────────────────────────────────────────────────────────
    add_field(
        'Open pit coal mining',
        'Coal when broken or exposed to the atmosphere during mining',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Open pit coal mining',
        'Coal when broken or exposed to the atmosphere during mining',
        'CH4',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Storage of petroleum products ──────────────────────────────────────────────────────
    add_field(
        'Storage of petroleum products',
        'Above-ground storage tanks',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Storage of petroleum products', 'Above-ground storage tanks', 'CH4', 'Replacement Methodology', 'Description'
    )

    # ── Activity: Aluminum or alumina production ─────────────────────────────────────────────────────
    # CO2 - Anode Consumption - Prebaked
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Prebaked',
        'Sulphur Content in Baked Anodes',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Prebaked',
        'Ash Content in Baked Anodes',
    )
    # CO2 - Anode Consumption - Soderberg
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Emissions of benzene-soluble matter',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Average binder (pitch) content in paste',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Sulphur content in pitch',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Ash content in pitch',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Hydrogen content in pitch',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Sulphur content in calcinated coke',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Ash content in calcinated coke',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode Consumption - Soderberg',
        'Carbon in skimmed dust from Søderberg cells',
    )
    # CO2 - Anode/Cathode Baking
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Packing coke consumption per tonne of baked anode',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Baked anode production',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Ash content in packing coke',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Sulphur content in packing coke',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Green anode consumption',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Hydrogen content in pitch',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Pitch content in green anode',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Anode/Cathode Baking',
        'Recovered tar',
    )
    # CO2 - Green Coke Calcination
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Green coke feed',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Humidity in green coke feed',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Volatiles in green coke feed',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Sulphur content in green coke feed',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Sulphur content in calcinated coke',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Calcinated coke produced',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Under-calcinated coke produced',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Green Coke Calcination',
        'Coke dust emissions',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
        'CO2',
        'Replacement Methodology',
        'Description',
    )
    # Anode effects - CF4
    add_field(
        'Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method', 'Anode Effect minutes per cell-day'
    )
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method', 'Anode Effect Frequency')
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method', 'Anode Effect Duration')
    add_field(
        'Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method', 'Frequency and Duration Methodology'
    )
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Slope method', 'Slope Coefficient')
    add_field(
        'Aluminum or alumina production',
        'Anode effects',
        'CF4',
        'Slope method',
        'Last Date of Slope Coefficients Measurement',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode effects',
        'CF4',
        'Overvoltage method',
        'Anode Effect Overvoltage Factor',
    )
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Overvoltage method', 'Potline Overvoltage')
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Overvoltage method', 'Current Efficiency')
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Overvoltage method', 'Overvoltage Methodology')
    add_field(
        'Aluminum or alumina production', 'Anode effects', 'CF4', 'Overvoltage method', 'Overvoltage Emission Factor'
    )
    add_field(
        'Aluminum or alumina production',
        'Anode effects',
        'CF4',
        'Overvoltage method',
        'Last Date of Overvoltage Emission Factor Measurement',
    )
    add_field(
        'Aluminum or alumina production',
        'Anode effects',
        'CF4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field('Aluminum or alumina production', 'Anode effects', 'CF4', 'Replacement Methodology', 'Description')
    # Anode effects - C2F6
    add_field(
        'Aluminum or alumina production',
        'Anode effects',
        'C2F6',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field('Aluminum or alumina production', 'Anode effects', 'C2F6', 'Replacement Methodology', 'Description')
    # Cover gas from electrolysis cells - SF6
    add_field(
        'Aluminum or alumina production',
        'Cover gas from electrolysis cells',
        'SF6',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Aluminum or alumina production',
        'Cover gas from electrolysis cells',
        'SF6',
        'Replacement Methodology',
        'Description',
    )

    # ── Bulk Description assignments for oil & gas activities ────────────────────────────────────────
    description_field = get_field('Description')
    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(
            name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
        ),
        methodology__name__in=[
            'Other CGA Methodology',
            'Alternative Parameter Measurement Methodology',
            'Replacement Methodology',
        ],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(
            name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
        ),
        methodology__name__in=[
            'Alternative Parameter Measurement Methodology',
            'Replacement Methodology',
            'Other CGA Methodology',
        ],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(name='LNG activities'),
        methodology__name__in=[
            'Alternative Parameter Measurement Methodology',
            'Replacement Methodology',
            'Other CGA Methodology',
        ],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(
            name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
        ),
        methodology__name__in=[
            'Replacement Methodology',
            'Alternative Parameter Measurement Methodology',
        ],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(
            name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
        ),
        methodology__name__in=[
            'Replacement Methodology',
            'Alternative Parameter Measurement Methodology',
        ],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    # ── Activity: Electricity generation ─────────────────────────────────────────────────────────────
    # CO2 - Measured CC and MW
    add_field(
        'Electricity generation',
        'Fuel combustion for electricity generation',
        'CO2',
        'Measured CC and MW',
        'Annual Weighted Average Carbon Content',
    )
    add_field(
        'Electricity generation',
        'Fuel combustion for electricity generation',
        'CO2',
        'Measured CC and MW',
        'Annual Weighted Average Molecular Weight',
    )
    add_field(
        'Electricity generation',
        'Fuel combustion for electricity generation',
        'CO2',
        'Measured CC and MW',
        'Molar Volume Conversion Factor',
    )
    # CO2 - other methodologies
    elec_co2_fields_mapping = {
        'Default HHV/Default EF': ['Fuel Default High Heating Value', 'Unit-Fuel-CO2 Default EF'],
        'Default EF': ['Unit-Fuel-CO2 Default EF'],
        'Measured HHV/Default EF': ['Fuel Annual Weighted Average High Heating Value', 'Unit-Fuel-CO2 Default EF'],
        'Measured Steam/Default EF': ['Unit-Fuel Annual Steam Generated', 'Boiler Ratio', 'Unit-Fuel-CO2 Default EF'],
        'Measured CC': ['Fuel Annual Weighted Average Carbon Content (weight fraction)'],
        'Measured Steam/Measured EF': ['Unit-Fuel Annual Steam Generated', 'Unit-Fuel-CO2 Measured Steam-Measured EF'],
        'Replacement Methodology': ['Description'],
        'Alternative Parameter Measurement Methodology': ['Description'],
    }
    for methodology_name, field_names in elec_co2_fields_mapping.items():
        element = ConfigurationElement.objects.get(
            activity=Activity.objects.get(name='Electricity generation'),
            source_type=SourceType.objects.get(name='Fuel combustion for electricity generation'),
            gas_type=GasType.objects.get(chemical_formula='CO2'),
            methodology=Methodology.objects.get(name=methodology_name),
            valid_from=valid_from,
            valid_to=valid_to,
        )
        for field_name in field_names:
            element.reporting_fields.add(ReportingField.objects.get(field_name=field_name))
    # CH4 and N2O
    add_combustion_ch4_fields('Electricity generation', 'Fuel combustion for electricity generation')
    add_combustion_n2o_fields('Electricity generation', 'Fuel combustion for electricity generation')
    # Other source types
    for source_type_name, gas_formula in [
        ('Acid gas scrubbers and acid gas reagents', 'CO2'),
        ('Geothermal geyser steam or fluids', 'CO2'),
        ('Installation, maintenance, operation and decommissioning of electrical equipment', 'SF6'),
    ]:
        add_field(
            'Electricity generation',
            source_type_name,
            gas_formula,
            'Alternative Parameter Measurement Methodology',
            'Description',
        )
        add_field('Electricity generation', source_type_name, gas_formula, 'Replacement Methodology', 'Description')
    # Cooling units - HFC gases
    for hfc_gas in [
        'HFC-23 (CHF3)',
        'HFC-32 (CH2F2)',
        'HFC-41 (CH3F)',
        'HFC-43-10mee (C5H2F10)',
        'HFC-125 (C2HF5)',
        'HFC-134 (C2H2F4)',
        'HFC-134a (C2H2F4)',
        'HFC-143 (C2H3F3)',
        'HFC-143a (C2H3F3)',
        'HFC-152a (C2H4F2)',
        'HFC-227ea (C3HF7)',
        'HFC-236fa (C3H2F6)',
        'HFC-245ca (C3H3F5)',
    ]:
        add_field(
            'Electricity generation',
            'Cooling units',
            hfc_gas,
            'Alternative Parameter Measurement Methodology',
            'Description',
        )
        add_field('Electricity generation', 'Cooling units', hfc_gas, 'Replacement Methodology', 'Description')

    # ── Activity: Industrial wastewater processing ────────────────────────────────────────────────────
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'CH4',
        'Chemical Oxygen Demand',
        'Average of Quarterly chemical oxygen demand',
        'kg/m3',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'CH4',
        'Biochemical Oxygen Demand',
        'Average of Quarterly five-day biochemical oxygen demand',
        'kg/m3',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'CH4',
        'Replacement Methodology',
        'Description',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'N2O',
        'Nitrogen in effluent',
        'Average of Quarterly Nitrogen in effluent',
        'kg/N m3',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'N2O',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Industrial wastewater processing',
        'Industrial wastewater process using anaerobic digestion',
        'N2O',
        'Replacement Methodology',
        'Description',
    )
    # Oil-water separators
    add_field(
        'Industrial wastewater processing',
        'Oil-water separators',
        'CH4',
        'Measured conversion factor',
        'Measured conversion factor',
        'kgCH4/kgNMHC',
    )
    add_field(
        'Industrial wastewater processing',
        'Oil-water separators',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Industrial wastewater processing', 'Oil-water separators', 'CH4', 'Replacement Methodology', 'Description'
    )

    # ── Activity: Cement production ───────────────────────────────────────────────────────────────────
    add_field(
        'Cement production',
        'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
        'CO2',
        'Oxidation Emissions',
        'Amount of raw material consumed (t)',
    )
    add_field(
        'Cement production',
        'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
        'CO2',
        'Oxidation Emissions',
        'Raw material organic carbon content (weight fraction)',
    )
    add_field(
        'Cement production',
        'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Cement production',
        'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Lime manufacturing ──────────────────────────────────────────────────────────────────
    add_field(
        'Lime manufacturing',
        'Calcination of carbonate materials in lime manufacturing',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Lime manufacturing',
        'Calcination of carbonate materials in lime manufacturing',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Coal storage at facilities that combust coal ────────────────────────────────────────
    add_field(
        'Coal storage at facilities that combust coal',
        'Stored coal piles',
        'CH4',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Coal storage at facilities that combust coal',
        'Stored coal piles',
        'CH4',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Zinc production ──────────────────────────────────────────────────────────────────────
    add_field(
        'Zinc production',
        'Use of reducing agents during zinc production',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Zinc production',
        'Use of reducing agents during zinc production',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Activity: Lead production ──────────────────────────────────────────────────────────────────────
    add_field(
        'Lead production',
        'Use of reducing agents during lead production',
        'CO2',
        'Alternative Parameter Measurement Methodology',
        'Description',
    )
    add_field(
        'Lead production',
        'Use of reducing agents during lead production',
        'CO2',
        'Replacement Methodology',
        'Description',
    )

    # ── Electricity transmission ───────────────────────────────────────────────────────────────────────
    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(name='Electricity transmission'),
        methodology__name__in=['Replacement Methodology', 'Alternative Parameter Measurement Methodology'],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)

    # ── Activity: Petroleum refining ──────────────────────────────────────────────────────────────────
    for element in ConfigurationElement.objects.filter(
        activity=Activity.objects.get(name='Petroleum refining'),
        methodology__name__in=['Alternative Parameter Measurement Methodology', 'Replacement Methodology'],
        valid_from=valid_from,
        valid_to=valid_to,
    ):
        element.reporting_fields.add(description_field)
    add_field(
        'Petroleum refining',
        'Oil-water separators at refineries',
        'CH4',
        'Measured conversion factor',
        'Measured conversion factor',
        'kgCH4/kgNMHC',
    )
    add_field(
        'Petroleum refining',
        'Wastewater processing using anaerobic digestion at refineries',
        'CH4',
        'Chemical Oxygen Demand',
        'Average of quarterly chemical oxygen demand (kg/m3)',
    )
    add_field(
        'Petroleum refining',
        'Wastewater processing using anaerobic digestion at refineries',
        'CH4',
        'Biochemical Oxygen Demand',
        'Average of quarterly five-day biochemical oxygen demand (kg/m3)',
    )
    add_field(
        'Petroleum refining',
        'Wastewater processing using anaerobic digestion at refineries',
        'N2O',
        'Nitrogen in effluent',
        'Average of quarterly nitrogen in effluent (kg/N m3)',
    )


def reverse_init_configuration_element_reporting_fields_data(apps, schema_editor):
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ReportingField = apps.get_model('reporting', 'ReportingField')
    for element in ConfigurationElement.objects.all():
        element.reporting_fields.clear()
    for field in ReportingField.objects.all():
        field.configuration_elements.clear()
    ConfigurationElement.objects.all().delete()
    ReportingField.objects.all().delete()


def init_emission_category_mapping_data(apps, schema_editor):
    EmissionCategoryMapping = apps.get_model('reporting', 'EmissionCategoryMapping')
    EmissionCategory = apps.get_model('reporting', 'EmissionCategory')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    EmissionCategoryMapping.objects.bulk_create(
        [
            # BASIC EMISSION CATEGORIES
            # FLARING
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petrochemical production'),
                source_type=SourceType.objects.get(name='Flares and oxidizers'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petrochemical production'),
                source_type=SourceType.objects.get(name='Ethylene production'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(
                    name='Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas flaring'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Flaring stacks'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Drilling flaring'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Hydraulic fracturing flaring'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well testing flaring'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas flaring'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Flaring stacks'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Flare stacks'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Flare stacks'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Flare stacks'),
                emission_category=EmissionCategory.objects.get(category_name='Flaring emissions'),
            ),
            # FUGITIVE
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Aluminum or alumina production'),
                source_type=SourceType.objects.get(name='Cover gas from electrolysis cells'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Underground coal mining'),
                source_type=SourceType.objects.get(name='Coal when broken or exposed to the atmosphere during mining'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Coal storage at facilities that combust coal'),
                source_type=SourceType.objects.get(name='Stored coal piles'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Cooling units'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Geothermal geyser steam or fluids'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(
                    name='Installation, maintenance, operation and decommissioning of electrical equipment'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electronics manufacturing'),
                source_type=SourceType.objects.get(
                    name='Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Magnesium production'),
                source_type=SourceType.objects.get(name='Cover gases or carrier gases in magnesium production'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petrochemical production'),
                source_type=SourceType.objects.get(name='Equipment leaks'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Above-ground storage tanks at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Equipment leaks at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Uncontrolled blowdown systems used at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Open pit coal mining'),
                source_type=SourceType.objects.get(name='Coal when broken or exposed to the atmosphere during mining'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Storage of petroleum products'),
                source_type=SourceType.objects.get(name='Above-ground storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Produced water dissolved carbon dioxide and methane'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Produced water dissolved carbon dioxide and methane'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity transmission'),
                source_type=SourceType.objects.get(
                    name='Installation, maintenance, operation and decommissioning of electrical equipment'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Produced water dissolved carbon dioxide and methane'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(
                    name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(category_name='Fugitive emissions'),
            ),
            # INDUSTRIAL PROCESS
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Aluminum or alumina production'),
                source_type=SourceType.objects.get(
                    name='Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Aluminum or alumina production'),
                source_type=SourceType.objects.get(name='Anode effects'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Ammonia production'),
                source_type=SourceType.objects.get(
                    name='Steam reformation or gasification of a hydrocarbon during ammonia production'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Cement production'),
                source_type=SourceType.objects.get(
                    name='Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Copper or nickel smelting or refining'),
                source_type=SourceType.objects.get(name='Removal of impurities using carbonate flux reagents'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Copper or nickel smelting or refining'),
                source_type=SourceType.objects.get(name='Use of reducing agents'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Copper or nickel smelting or refining'),
                source_type=SourceType.objects.get(
                    name='Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Copper or nickel smelting or refining'),
                source_type=SourceType.objects.get(
                    name='The solvent extraction and electrowinning process, also known as SX-EW'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Acid gas scrubbers and acid gas reagents'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Ferroalloy production'),
                source_type=SourceType.objects.get(
                    name='Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Glass manufacturing'),
                source_type=SourceType.objects.get(name='Calcination of carbonate materials'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Hydrogen production'),
                source_type=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Lead production'),
                source_type=SourceType.objects.get(name='Use of reducing agents during lead production'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Lime manufacturing'),
                source_type=SourceType.objects.get(name='Calcination of carbonate materials in lime manufacturing'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Magnesium production'),
                source_type=SourceType.objects.get(name='Use of reducing agents in magnesium production'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Nitric acid manufacturing'),
                source_type=SourceType.objects.get(
                    name='Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petrochemical production'),
                source_type=SourceType.objects.get(name='Process units'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Catalyst regeneration'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Asphalt production'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Sulphur recovery'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Delayed coking units at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Coke calcining at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Phosphoric acid production'),
                source_type=SourceType.objects.get(name='Reaction of calcium carbonate with sulphuric acid'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Pulp and paper production'),
                source_type=SourceType.objects.get(name='Pulping and chemical recovery'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Zinc production'),
                source_type=SourceType.objects.get(name='Use of reducing agents during zinc production'),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Carbonate use'),
                source_type=SourceType.objects.get(
                    name='Carbonates used but not consumed in other activities set out in column 2'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Industrial process emissions'),
            ),
            # ON-SITE TRANSPORTATION
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Fuel combustion by mobile equipment'),
                source_type=SourceType.objects.get(
                    name='Fuel combustion by mobile equipment that is part of the facility'
                ),
                emission_category=EmissionCategory.objects.get(category_name='On-site transportation emissions'),
            ),
            # STATIONARY FUEL COMBUSTION EMISSIONS
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Fuel combustion for electricity generation'),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Refinery fuel gas combustion'),
                source_type=SourceType.objects.get(
                    name='Combustion of refinery fuel gas, still gas, flexigas or associated gas'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='Field gas or process vent gas combustion at a linear facilities operation'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='Field gas or process vent gas combustion at a linear facilities operation'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Stationary fuel combustion emissions'),
            ),
            # VENTING EMISSIONS - USEFUL
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — useful'),
            ),
            # VENTING EMISSIONS - NON USEFUL
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petrochemical production'),
                source_type=SourceType.objects.get(name='Process vents'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Process vents'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Loading operations at refineries and terminals'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Acid gas removal venting or incineration'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Dehydrator venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Releases from tanks used for storage, production or processing'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Centrifugal compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Reciprocating compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Enhanced oil recovery injection pump blowdowns'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Dehydrator venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well venting for liquids unloading'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Gas well venting during well completions and workovers with or without hydraulic fracturing'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Drilling venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Releases from tanks used for storage, production or processing'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well testing venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Enhanced oil recovery injection pump blowdowns'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Centrifugal compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Reciprocating compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Acid gas removal venting or incineration'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Dehydrator venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(
                    name='Releases from tanks used for storage, production or processing'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Centrifugal compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Reciprocating compressor venting'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Enhanced oil recovery injection pump blowdowns'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='LNG activities'),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(category_name='Venting emissions — non-useful'),
            ),
            # EMISSIONS FROM WASTE
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of waste without production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from waste'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from waste'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from waste'),
            ),
            # EMISSIONS FROM WASTEWATER
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Industrial wastewater processing'),
                source_type=SourceType.objects.get(name='Industrial wastewater process using anaerobic digestion'),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from wastewater'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Industrial wastewater processing'),
                source_type=SourceType.objects.get(name='Oil-water separators'),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from wastewater'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(name='Oil-water separators at refineries'),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from wastewater'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Petroleum refining'),
                source_type=SourceType.objects.get(
                    name='Wastewater processing using anaerobic digestion at refineries'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from wastewater'),
            ),
            # FUEL EXCLUDED CATEGORIES
            # CO2 emissions from excluded woody biomass
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of waste without production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Fuel combustion by mobile equipment'),
                source_type=SourceType.objects.get(
                    name='Fuel combustion by mobile equipment that is part of the facility'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Fuel combustion for electricity generation'),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Pulp and paper production'),
                source_type=SourceType.objects.get(name='Pulping and chemical recovery'),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='CO2 emissions from excluded woody biomass'
                ),
            ),
            # Other emissions from excluded biomass
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of waste without production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Fuel combustion by mobile equipment'),
                source_type=SourceType.objects.get(
                    name='Fuel combustion by mobile equipment that is part of the facility'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Fuel combustion for electricity generation'),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Pulp and paper production'),
                source_type=SourceType.objects.get(name='Pulping and chemical recovery'),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Other emissions from excluded biomass'),
            ),
            # Emissions from excluded non-biomass
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary combustion excluding line tracing'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of waste without production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Fuel combustion by mobile equipment'),
                source_type=SourceType.objects.get(
                    name='Fuel combustion by mobile equipment that is part of the facility'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='Electricity generation'),
                source_type=SourceType.objects.get(name='Fuel combustion for electricity generation'),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion, other than non-compression and non-processing combustion'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(category_name='Emissions from excluded non-biomass'),
            ),
            # OTHER EXCLUDED CATEGORIES
            # Emissions from line tracing and non-processing and non-compression activities
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Dehydrator venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well venting for liquids unloading'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Gas well venting during well completions and workovers with or without hydraulic fracturing'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Drilling flaring'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Drilling venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Hydraulic fracturing flaring'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Releases from tanks used for storage, production or processing'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well testing venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Well testing flaring'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Associated gas flaring'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Flaring stacks'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Enhanced oil recovery injection pump blowdowns'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Produced water dissolved carbon dioxide and methane'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(
                    name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities that are oil and gas extraction and gas processing activities'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic high bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic pump venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic low bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Natural gas pneumatic intermittent bleed device venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Blowdown venting'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Flare stacks'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(
                    name='Equipment leaks detected using leak detection and leaker emission factor methods'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Population count sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Transmission storage tanks'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Other venting sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Other fugitive sources'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(
                    name='Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission'
                ),
                source_type=SourceType.objects.get(name='Third party line hits with release of gas'),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
            EmissionCategoryMapping(
                activity=Activity.objects.get(name='General stationary non-compression and non-processing combustion'),
                source_type=SourceType.objects.get(
                    name='Field gas or process vent gas combustion at a linear facilities operation'
                ),
                emission_category=EmissionCategory.objects.get(
                    category_name='Emissions from line tracing and non-processing and non-compression activities'
                ),
            ),
        ]
    )


def reverse_init_emission_category_mapping_data(apps, schema_editor):
    EmissionCategoryMapping = apps.get_model('reporting', 'EmissionCategoryMapping')
    EmissionCategoryMapping.objects.all().delete()


def init_custom_schema_data(apps, schema_editor):
    cwd = os.getcwd()

    # Get the model classes
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')

    valid_from = Configuration.objects.get(valid_from='2023-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')

    # (activity_name, source_type_name, methodology_name, gas_formula, json_schema_path)
    CUSTOM_SCHEMA_CONFIGS = [
        (
            'Hydrogen production',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'Feedstock Material Balance',
            'CO2',
            'reporting/json_schemas/2024/hydrogen_production/feedstock_material_balance_custom.json',
        ),
        (
            'Open pit coal mining',
            'Coal when broken or exposed to the atmosphere during mining',
            'Emissions Factor Methodology',
            'CH4',
            'reporting/json_schemas/2024/open_pit_coal_mining/emission_factor_methodology_custom.json',
        ),
        (
            'Cement production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'Calcination Emissions',
            'CO2',
            'reporting/json_schemas/2024/cement_production/calcination_of_emissions_custom.json',
        ),
        (
            'Lime manufacturing',
            'Calcination of carbonate materials in lime manufacturing',
            'Calculated',
            'CO2',
            'reporting/json_schemas/2024/lime_manufacturing/calculated_custom.json',
        ),
        (
            'Coal storage at facilities that combust coal',
            'Stored coal piles',
            'Default EF',
            'CH4',
            'reporting/json_schemas/2024/coal_storage/default_ef_custom.json',
        ),
        (
            'Zinc production',
            'Use of reducing agents during zinc production',
            'Measured CC',
            'CO2',
            'reporting/json_schemas/2024/zinc_production/measured_cc_custom.json',
        ),
        (
            'Lead production',
            'Use of reducing agents during lead production',
            'Measured CC',
            'CO2',
            'reporting/json_schemas/2024/lead_production/measured_cc_custom.json',
        ),
    ]

    for activity_name, source_type_name, methodology_name, gas_formula, json_schema_path in CUSTOM_SCHEMA_CONFIGS:
        with open(f'{cwd}/{json_schema_path}') as schema_file:
            schema = json.load(schema_file)

        CustomMethodologySchema.objects.create(
            activity=Activity.objects.get(name=activity_name),
            source_type=SourceType.objects.get(name=source_type_name),
            json_schema=schema,
            methodology=Methodology.objects.get(name=methodology_name),
            gas_type=GasType.objects.get(chemical_formula=gas_formula),
            valid_from=valid_from,
            valid_to=valid_to,
        )


def reverse_init_custom_schema_data(apps, schema_editor):
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')
    CustomMethodologySchema.objects.all().delete()


def handle_emissions(apps, emissions_list):
    GasType = apps.get_model("reporting", "GasType")

    for e in emissions_list:
        gas_type_name = e.get("gasType")
        if gas_type_name is None:
            continue

        gas_type = GasType.objects.filter(chemical_formula=gas_type_name).first()

        emission_value = e.get("emission")
        if emission_value is not None and gas_type is not None:
            e["equivalentEmission"] = float(round(Decimal(emission_value) * gas_type.gwp, 4))
        else:
            e["equivalentEmission"] = None


def find_emissions(apps, data, emissions_key):
    if isinstance(data, dict):
        if emissions_key in data and isinstance(data[emissions_key], list):
            handle_emissions(apps, data[emissions_key])
        for field_name, field_value in data.items():
            data[field_name] = find_emissions(apps, field_value, emissions_key)
    elif isinstance(data, list):
        return [find_emissions(apps, element, emissions_key) for element in data]
    return data


def migrate_json_data(apps, schema_editor):
    import common.lib.pgtrigger as pgtrigger

    ReportRawActivityData = apps.get_model("reporting", "ReportRawActivityData")
    for record in ReportRawActivityData.objects.all():
        raw_data = record.json_data
        updated_data = find_emissions(apps, raw_data, "emissions")
        record.json_data = updated_data
        with pgtrigger.ignore("reporting.ReportRawActivityData:immutable_report_version"):
            record.save(update_fields=["json_data"])
