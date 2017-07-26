from redactor import redactor

test='Help word has many synonyms such as aid, assistant, avail, help, help_oneself, serve, avail and many other words.\nDogs are very kind animals but that statement does not hold true for each and every dog.\n As human beings we should help each others.'

def test_function():
    (x,c)=redactor.get_concepts(test,['help'])
    c=sorted(c)
    assert c==['aid', 'assistant', 'avail', 'avail', 'help', 'help', 'help_oneself', 'serve']
    assert x=='þþþþ þþþþ þþþ þþþþ þþþþþþþþ þþþþ þþ þþþþ þþþþþþþþþþ þþþþþþ þþþþþ þþþþþþþþþþþþþ þþþþþþ þþþþþ þþþ þþþþ þþþþþ þþþþþþ\nDogs are very kind animals but that statement does not hold true for each and every dog . þþ þþþþþ þþþþþþ þþ þþþþþþ þþþþ þþþþ þþþþþþþ'


'''
def get_concepts(text,concept):
    #concepts=[]
    
    import re
    import nltk
    from nltk.corpus import wordnet
    from nltk.corpus import wordnet as wn
    
    for i in concept:
        x=wn.synsets(i)
        l=[]
        
        for i in x:
        	l.append(str(i))
        
        syn=[]
        
        for i in l:
        	a=re.search(r'\'(\w+)\.',i)
        	syn.append(a.group(1))
        sample2=text#the text obtained from the file
        #sample2='Help word has many synonyms such as aid, assistant, avail, help, help_oneself, serve, avail and many other words.\nDogs are very kind animals but that statement does not hold true for each and every dog.\n As human beings we should help each others.'
        s2=''
        
        s2=sample2.split('\n')#Can also use sent tokenise for splitting into sentences
        
        y=''
        stats=''
        count_line=1
        for i in s2:
        	words=[]
        	words=nltk.word_tokenize(i)
        	count=0
        	s=''
        	temp=''
        	for j in words:
        		if j in syn:
        			count+=1
        			temp+=j+" "
        		else:
        			s+=j
        			s+=' '
        	if count>0:
        		y+='þ.'
        		tmp=str(count_line)
        		stats+=" Word(s): "+temp+" present so redacted the sentence "+tmp+"\n"
        	else:
        		if(s!=''):
        			y+=s
        			y+='\n'
        	count_line+=1 
'''