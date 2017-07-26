from redactor import redactor

test=" my name is Vishnu, I am studying MS in United States. I have best friends Krishna, Nirajan in INDIA. We three Vishnu, Krishna and Nirajan are best examples for 3 idiots."

def test_function():
    (x,l,n)=redactor.get_names_locations(test)
        
    assert x== ' my name is þþþþþþ, I am studying MS in United States. I have best friends þþþþþþþ, þþþþþþþ in þþþþþ. We three þþþþþþ, þþþþþþþ and þþþþþþþ are best examples for 3 idiots.'
    assert l==['INDIA', 'UnitedStates']
    assert n==['Krishna', 'Nirajan', 'Vishnu']
    
