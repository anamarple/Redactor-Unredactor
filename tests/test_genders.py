from redactor import redactor

test="Him and her are like besties. A relationship between men and Women can also be said as between Male and female."

def test_function():
    (x,c)=redactor.get_gender(test)
    #d=sorted(c)
    assert x=='þþþ and þþþ are like besties . A relationship between þþþ and þþþþþ can also be said as between þþþþ and þþþþþþ . \n'
    assert c==6