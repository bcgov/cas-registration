from ninja.responses import codes_4xx

custom_codes_4xx = codes_4xx | frozenset({422})

generic_error_codes_4xx = frozenset(code for code in codes_4xx if code != 422)
