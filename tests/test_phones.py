from redactor import redactor

test="555 1234567,(926)1234567,(926) 1234567,7926123456,9261234567,1234567,123-4567 and 8500700022 are different phone numbers i would like to support"

def test_function():
    (x,c)=redactor.phones(test)
    d=sorted(c)
    assert d==['(926) 1234567', '(926)1234567', '123-4567', '1234567', '555 1234567', '7926123456', '8500700022', '9261234567']
    assert x=='þþþþþþþþþþþ,þþþþþþþþþþþþ,þþþþþþþþþþþþþ,þþþþþþþþþþ,þþþþþþþþþþ,þþþþþþþ,þþþþþþþþ and þþþþþþþþþþ are different phone numbers i would like to support' 
    
    
'''
def phones(data):
    text=data
    import re
    #text="+42 555.123.4567,+1-(800)-123-4567,+7 555 1234567,+7(926)1234567,(926) 1234567,+79261234567,9261234567,1234567,123-4567,123-89-01,495 1234567,469 123 45 67 and +918500700022"
    p=[]
    p=re.findall(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}',text)
    for i in p:
        text=text.replace(i,'*')
    return text 



'''    