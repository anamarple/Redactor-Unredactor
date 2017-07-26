from redactor import redactor

test="I have exam on 31-10-2016 and my date of birth is 23/10/1995"

def test_function():
    (x,c)=redactor.dates(test)
    d=sorted(c)
    assert d == ['23/10/1995', '31-10-2016']
    assert x=="I have exam on þþþþþþþþþþ and my date of birth is þþþþþþþþþþ"