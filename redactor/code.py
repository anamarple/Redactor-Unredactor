# -*- coding: utf-8 -*-
"""
Created on Tue Apr  4 23:00:39 2017

@author: vishnu
"""

#!/usr/bin/python3
import sys

#print ('Number of arguments:', len(sys.argv), 'arguments.')
#print ('Argument List:', str(sys.argv))
a_list=[]
a_list=sys.argv
#print(a_list)

#import re

#a=re.search(r'\-\-(\w+)\.',i)

input_label='--input'
flags=["--names","--dates","--places","--phones","--genders","--addresses"]
concept_label='--concept'
output_label='--output'
stats_label=["stderr","stdout"]
not_concept=["--input","--names","--dates","--places","--phones","--genders","--addresses","--output","--stats"]
count=0
input_commands=[]
flags_commands=[]
concepts_commands=[]
output_commands=''
stats_commands=[]
for i in a_list:
    #print("{0}+\n".format(i))
    if i == input_label:        
        input_commands.append(a_list[count+1])
    elif i in flags:
        f=str(a_list[count])[2:]
        flags_commands.append(f)
    elif i == concept_label:
        for k in range(count,len(a_list)):
            if a_list[k] in not_concept:
                break
            else:
                concepts_commands.append(a_list[k])
    elif i==output_label:
        output_commands=a_list[count+1][:-1]
    elif i in stats_label:
        for k in range(count,len(a_list)):
            stats_commands.append(a_list[k])                              
    count+=1
#print(input_commands)
#print(flags_commands)
#print(concepts_commands)
#print(output_commands)
#print(stats_commands)
import glob
html_files=[]
text_files=[]
for i in input_commands:
    if i=='*.html':
        html_files=glob.glob(i)
    elif i=='otherfiles/*.txt':
        text_files=glob.glob(i)
 

#-----------------------code for locations and names       
#print("{0}\n\n{1}".format(html_files,text_files))
from nltk import ne_chunk, pos_tag, word_tokenize
from nltk.tree import Tree

#
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

def get_names_locations(data):
    #path='docs/sample4.txt'
    #with open(path, 'r') as myfile:
    #    data=myfile.read().replace('\n', '')
    #myfile.close()
    text=data
    text_up=text.upper()
    s=get_continuous_chunks(text)
    for i in s:
        text=text.replace(i,'*')
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
    
    return text
'''
Stats=''
if(loc_find==True):
    Stats+="The number of locations found are "+ str(len(locations))+" :"+str(locations)+"\n\n"
if(nam_find==True):
    Stats+="The number of names found are "+ str(len(names))+" :"+str(names)+"\n\n"        
'''        
#------------    

def phones(data):
    text=data
    import re
    text="+42 555.123.4567,+1-(800)-123-4567,+7 555 1234567,+7(926)1234567,(926) 1234567,+79261234567,9261234567,1234567,123-4567,123-89-01,495 1234567,469 123 45 67 and +918500700022"
    p=[]
    p=re.findall(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}',text)
    for i in p:
        text=text.replace(i,'*')
    return text    
#------------------------        
def dates(data):
    import re
    text=data
    dates=[] 
    d_1=re.findall(r'(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9][-|\/](?!1[3-9]|00)[01][0-9][-|\/](?!10|28|29)\d{2,4}',text)
    d_2=re.findall(r'[\d{1}|\d{2}|st|rd|th|nd]{0,4}\s{0,1}[january|february|march|april|may|june|july|august|september|october|november|december]{3,9}\s{0,1}\d{2,4}',text,flags=re.I)
    d_3=re.findall(r'[sunday|monday|tuesday|wednesday|thursday|friday|saturday]{3,9}',text,flags=re.I)
    d_actual=[]
    
    for i in d_3:
        d_actual.append(i[1:])
    l=['monday','tuesday','thursday','wednesday','friday','saturday','sunday']
    a=[]   
    for i in d_actual:
        x=i.lower()
        for j in l:
            if (x==j or x==j[:3]):
                a.append(i)
    
    for i in d_1:
        dates.append(i)
    for i in d_2:
        dates.append(i)
    for i in d_3:
        dates.append(i)
    for i in a:
        dates.append(i)
    
    for i in dates:
        text=text.replace(i,"*")
    return text
#---------------------------------
#3. ---------Gender
def get_gender(data):
    genders=['he','she','him','her','his','hers','male','female','man','woman','men','women','He','She','Him','Her','His','Hers','Male','Female','Man','Woman','Men','Women','HE','SHE','HIM','HER','HIS','HERS','MALE','FEMALE','MAN','WOMAN','MEN','WOMEN']
    #path='docs/sample3.txt'
    import nltk
    #with open(path,'r') as  myfile:
    #    data=myfile.read()
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
#------------------------------------------ 
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
        
        s2=sample2.split('.')#Can also use sent tokenise for splitting into sentences
        
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
#-------------------------------------------------------------------------------------------
#5------printing to pdf files
def get_output(loc):
    import os
    count_redactedFiles=0
    count_redactedHtmlFiles=len(html_files)
    count_redactedTextFiles=len(text_files)
    count_redactedFiles=count_redactedHtmlFiles+count_redactedTextFiles
    os.system("mkdir {0}".format(loc))
    for i in range(0,count_redactedHtmlFiles):
        f_name=''
        f_name=html_files[i]
        f_name=f_name.replace(".html",".pdf")
        #os.system("enscript my_text_file.txt -o - | ps2pdf - output.pdf")
        os.system("enscript {0} -o - | ps2pdf - {1}/{2}".format(html_files[i],loc,f_name))
    for i in range(0,count_redactedTextFiles):
        #os.system("enscript my_text_file.txt -o - | ps2pdf - output.pdf")
        os.system("enscript {0} -o - | ps2pdf - {1}/{2}".format(text_files[i],loc,))
    
    Stats=''
    Stats=("The total number of redacted Files are {0} in which Html files count is {1} and Text files count is {2}".format(count_redactedFiles,count_redactedHtmlFiles,count_redactedTextFiles))
    #have to return stats
#-------------------------------------------------------------------------------------------
    
for i in html_files:
    with open(i,'r') as file:
        data=file.read()
    file.close()
    text=''
    text=data
    text=text.replace('<body>','þ')
    text=text.replace('</body>','þ')
    count=0
    text_embed=''
    for i in text:
        if i=='þ':
            count+=1
        if count>0 and count<2:
            text_embed+=i
    text_embed=text_embed[1:]
    c=0
    t=''
    t=text_embed
    t=t.replace('<style>','þ')
    t=t.replace('</style>','þ')
    
    #t_1=t_1.replace('þ','')    
    t_e=''
    for i in t:    
        if i=='<':
            c=0
        if i=='>':
            c=1
        if c==1:
            t_e+=i
    
    t_e=t_e.replace('\n','')
    t_e=t_e.replace('>','')
    c=0
    t_e_1=''
    for i in t_e:    
        if i=='þ':
            c+=1
        if c%2==0:
            t_e_1+=i
    t_n_l=get_names_locations(t_e_1)
    p=phones(t_n_l)#---------------------have to return in all methods
    d=dates(p)
    g=get_gender(d)
    n=get_output(g,output_commands)
    
            
