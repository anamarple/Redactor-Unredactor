from redactor import redactor


text='I have exam on ****** and my date of birth is *********. I live in ** and currently pursuing my masters at *********** ** ***********.'
import os
os.system("mkdir {0}".format("output"))
def test_function():
    (x)=redactor.get_output(text,"otherfiles/test.txt","output")
    
    assert x==['output/test.pdf']

