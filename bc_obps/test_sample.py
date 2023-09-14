# Missing module docstring (missing-module-docstring)
# Missing function or method docstring (missing-function-docstring)
# Argument name "x" doesn't conform to snake_case naming style (invalid-name)


# pylint: skip-file
def func(x):
    return x + 1


def test_answer():
    assert func(3) == 4
