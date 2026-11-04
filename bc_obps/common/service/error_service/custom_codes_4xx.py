from ninja.responses import codes_4xx

custom_codes_4xx = codes_4xx | frozenset({422})
