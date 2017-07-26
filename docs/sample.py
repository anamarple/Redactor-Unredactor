#path='/home/vishnu/Desktop/redactor/docs/sample.txt'

# 0. ----extracting names and locations from the text   

from nltk import ne_chunk, pos_tag, word_tokenize
from nltk.tree import Tree

def get_continuous_chunks(text):
    chunked = ne_chunk(pos_tag(word_tokenize(text)))
    prev=None
    continuous_chunk = []
    current_chunk = []

    for i in chunked:
        if type(i) == Tree:
            current_chunk.append(" ".join([token for token, pos in i.leaves()]))
        elif current_chunk:
            named_entity = " ".join(current_chunk)
            if named_entity not in continuous_chunk:
                continuous_chunk.append(named_entity)
                current_chunk = []
        else:
            continue
    if current_chunk:
        named_entity = " ".join(current_chunk)
        if named_entity not in continuous_chunk:
            continuous_chunk.append(named_entity)
            current_chunk = []
    return continuous_chunk

path='docs/sample4.txt'
with open(path, 'r') as myfile:
	data=myfile.read().replace('\n', '')
myfile.close()
text=data
text_up=text.upper()
s=get_continuous_chunks(text)

from geotext import GeoText
places=GeoText(s)
loc_city=[]
loc_country=[]
loc_city=places.cities
loc_country=places.countries
locations=[]
for i in loc_city:
    locations.append(i)
    
for i in loc_country:
    locations.append(i)

names=[]
for i in s:
	if i not in locations:
		names.append(i)

Stats=''
if(loc_find==True):
	Stats+="The number of locations found are "+ str(len(locations))+" :"+str(locations)+"\n\n"
if(nam_find==True):
	Stats+="The number of names found are "+ str(len(names))+" :"+str(names)+"\n\n"

#txt = "Barack Obama is a great person." 
#print get_continuous_chunks(txt)
#a=re.search(r'\'(\w+)\.',str(x[5]))
#a.group(1)

#1. -----opening and closing a text file with chnages in directory
path='docs/sample2.txt' #if you are executing from the redactor location
with open(path, 'r') as myfile:
	data=myfile.read().replace('\n', '')

with open(path, 'w') as file:
  file.write(filedata)


#2. ------for identifying the synonyms of word
#here open file but dont remove '\n' from the string
import re
from nltk.corpus import wordnet
from nltk.corpus import wordnet as wn
x=wn.synsets('dog')
l=[]

for i in x:
	l.append(str(i))

syn=[]

for i in l:
	a=re.search(r'\'(\w+)\.',i)
	syn.append(a.group(1))
sample2=''
s2=sample2.split('\n')


for i in s2:
...     words=[]
...     words=word_tokenize(i)
...     count=0
...     for j in words:
...             if j in syn:
...                     count+=1
...     if count>0:
...             print('*')
...     else:
...             print(i)
... 


#3. ---------Gender
def get_gender(data):
    genders=['he','she','him','her','his','hers','male','female','man','woman','men','women','He','She','Him','Her','His','Hers','Male','Female','Man','Woman','Men','Women','HE','SHE','HIM','HER','HIS','HERS','MALE','FEMALE','MAN','WOMAN','MEN','WOMEN']
    #path='docs/sample3.txt'
    import nltk
    #with open(path,'r') as  myfile:
    #	data=myfile.read()
    sent=data.split('\n')
    y=''
    stats=''
    count_gender=0
    for i in sent:
    	x=[]
    	x=nltk.word_tokenize(i)
    	count=0
    	for j in x:
    		if j in genders:
    			x[count]='*'
    			y+="* "
    			count_gender+=1
    		else:
    			y+=j
    			y+=' '
    		count+=1
    	y+='\n'
     return y

stats+='Number of Gender words replaced by * are '+str(count_gender)

#4. --------Concepts, continuation of 2 from synonms

concepts=[]

import re
import nltk
from nltk.corpus import wordnet
from nltk.corpus import wordnet as wn
x=wn.synsets('help')
l=[]

for i in x:
	l.append(str(i))

syn=[]

for i in l:
	a=re.search(r'\'(\w+)\.',i)
	syn.append(a.group(1))
sample2=''#the text obtained from the file
#sample2='Help word has many synonyms such as aid, assistant, avail, help, help_oneself, serve, avail and many other words.\nDogs are very kind animals but that statement does not hold true for each and every dog.\n As human beings we should help each others.'
s2=''

s2=sample2.split('.')

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
		y+='*.'
		tmp=str(count_line)
		stats+=" Word(s): "+temp+" present so redacted the sentence "+tmp+"\n"
	else:
		if(s!=''):
			y+=s
			y+='.'
	count_line+=1 





	

#5------printing to pdf files
import os
count_redactedFiles=0
os.system("mkdir {0}".format("myfiles"))
for i in range(0,count_redactedFiles):
    
os.system("enscript my_text_file.txt -o - | ps2pdf - output.pdf")


