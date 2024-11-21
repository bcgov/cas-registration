# Generated by Django 5.0.9 on 2024-11-20 22:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0056_remove_historicaltransferevent_future_designated_operator_and_more'),
    ]

    def update_regulated_product_units_and_is_regulated(apps, schema_editor):

        RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')

        RegulatedProduct.objects.filter(
            name='BC-specific refinery complexity throughput',
        ).update(unit='BCRCT')
        RegulatedProduct.objects.filter(
            name='Cement equivalent',
        ).update(unit='Tonne cement equivalent')
        RegulatedProduct.objects.filter(
            name='Chemicals: pure hydrogen peroxide',
        ).update(unit='Tonne pure hydrogen peroxide')
        RegulatedProduct.objects.filter(
            name='Compression, centrifugal - consumed energy',
        ).update(unit='MWh consumed energy')
        RegulatedProduct.objects.filter(
            name='Compression, positve displacement - consumed energy',
        ).update(unit='MWh consumed energy')
        RegulatedProduct.objects.filter(
            name='Gypsum wallboard',
        ).update(unit='Thousand square feet')
        RegulatedProduct.objects.filter(
            name='Lime at 94.5% CaO and lime kiln dust',
        ).update(unit='Tonne lime@94.5% CAO + LKD')
        RegulatedProduct.objects.filter(
            name='Limestone for sale',
        ).update(unit='Tonne limestone')
        RegulatedProduct.objects.filter(
            name='Liquefied natural gas',
        ).update(unit=None)
        RegulatedProduct.objects.filter(
            name='Mining: coal',
        ).update(unit='Tonne saleable coal')
        RegulatedProduct.objects.filter(
            name='Mining: copper-equivalent, open pit',
        ).update(unit='Tonne copper-equivalent')
        RegulatedProduct.objects.filter(
            name='Mining: copper-equivalent, underground',
        ).update(unit='Tonne copper-equivalent')
        RegulatedProduct.objects.filter(
            name='Mining: gold-equivalent',
        ).update(unit='Tonne gold-equivalent')
        RegulatedProduct.objects.filter(
            name='Processing sour gas - oil equivalent',
        ).update(unit='Cubic metre oil-equivalent')
        RegulatedProduct.objects.filter(
            name='Processing sweet gas - oil equivalent',
        ).update(unit='Cubic metre oil-equivalent')
        RegulatedProduct.objects.filter(
            name='Pulp and paper: chemical pulp',
        ).update(unit='Tonne saleable dry chemical pulp')
        RegulatedProduct.objects.filter(
            name='Pulp and paper: non-chemical pulp',
        ).update(unit='Tonne saleable dry non-chemical pulp')
        RegulatedProduct.objects.filter(
            name='Pulp and paper: paper (except newsprint and tissue paper)',
        ).update(unit='Tonne saleable paper')
        RegulatedProduct.objects.filter(
            name='Pulp and paper: tissue Paper',
        ).update(unit='Tonne saleable tissue paper')
        RegulatedProduct.objects.filter(
            name='Rendering and meat processing: protein and fat',
        ).update(unit='Tonne protein and fat')
        RegulatedProduct.objects.filter(
            name='Renewable diesel',
        ).update(unit=None)
        RegulatedProduct.objects.filter(
            name='Smelting: aluminum',
        ).update(unit='Tonne saleable aluminum')
        RegulatedProduct.objects.filter(
            name='Smelting: lead-zinc',
        ).update(unit='Tonne lead-zinc')
        RegulatedProduct.objects.filter(
            name='Sold electricity',
        ).update(unit='GWh')
        RegulatedProduct.objects.filter(
            name='Sold Heat',
        ).update(unit='GJ')
        RegulatedProduct.objects.filter(
            name='Steel wire: HDG-process (hot dip galvanization)',
        ).update(unit='Tonne hot dip galvanization wire')
        RegulatedProduct.objects.filter(
            name='Steel wire: Non-HDG',
        ).update(unit='Tonne non-HDG wire')
        RegulatedProduct.objects.filter(
            name='Sugar: liquid',
        ).update(unit='Tonne solid sugar content')
        RegulatedProduct.objects.filter(
            name='Sugar: solid',
        ).update(unit='Tonne solid sugar')
        RegulatedProduct.objects.filter(
            name='Wood products: lumber',
        ).update(unit='Cubic metre saleable lumber')
        RegulatedProduct.objects.filter(
            name='Wood products: medium density fibreboard (MDF)',
        ).update(unit='Cubic metre saleable MDF')
        RegulatedProduct.objects.filter(
            name='Wood products: plywood',
        ).update(unit='Cubic metre saleable plywood')
        RegulatedProduct.objects.filter(
            name='Wood products: veneer',
        ).update(unit='Cubic metre saleable veneer')
        RegulatedProduct.objects.filter(
            name='Wood products: wood chips (including hog fuel)',
        ).update(unit='Cubic metre saleable wood chips')
        RegulatedProduct.objects.filter(
            name='Wood products: wood pellets',
        ).update(unit='Tonne saleable wood pellets')
        RegulatedProduct.objects.filter(
            name='Forged steel balls: less than 3.5 inches diameter',
        ).update(unit='Tonne forged steel balls')
        RegulatedProduct.objects.filter(
            name='Forged steel balls: greater than 4 inches diameter',
        ).update(unit='Tonne forged steel balls')
        RegulatedProduct.objects.filter(
            name='Mining: critical mineral, other than copper',
        ).update(unit=None)
        RegulatedProduct.objects.filter(
            name='Smelting: critical mineral, other than aluminun and lead-zinc',
        ).update(unit=None)

    def add_unregulated_products(apps, schema_editor):
        RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')

        RegulatedProduct.objects.create(
            name='Oil and gas non-processing, non-compression',
            unit=None,
            is_regulated=False,
        )
        RegulatedProduct.objects.create(
            name='Fat, oil and grease collection, refining and storage',
            unit=None,
            is_regulated=False,
        )

    def reverse_add_unregulated_products(apps, schema_editor):
        RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')

        RegulatedProduct.objects.filter(
            name='Oil and gas non-processing, non-compression',
        ).delete()
        RegulatedProduct.objects.filter(
            name='Fat, oil and grease collection, refining and storage',
        ).delete()

    operations = [
        migrations.AlterModelTableComment(
            name='regulatedproduct',
            table_comment='Table containing regulated and unregulated products. Regulated product means a product listed in column 2 of Table 2 of Schedule A.1 of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015. Unregulated products have been added to the dataset to assist in grouping some unregulated emissions for further analysis.',
        ),
        migrations.AddField(
            model_name='historicalregulatedproduct',
            name='is_regulated',
            field=models.BooleanField(db_comment='Indicates if a product is regulated', default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='historicalregulatedproduct',
            name='unit',
            field=models.CharField(
                blank=True, db_comment='The unit of measure for a regulated product', max_length=1000, null=True
            ),
        ),
        migrations.AddField(
            model_name='regulatedproduct',
            name='is_regulated',
            field=models.BooleanField(db_comment='Indicates if a product is regulated', default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='regulatedproduct',
            name='unit',
            field=models.CharField(
                blank=True, db_comment='The unit of measure for a regulated product', max_length=1000, null=True
            ),
        ),
        migrations.RunPython(update_regulated_product_units_and_is_regulated),
        migrations.RunPython(add_unregulated_products, reverse_add_unregulated_products),
    ]
