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
#stats_label=["stderr","stdout"]
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
    elif i == "--stats":
        for k in range(a_list.index(i),len(a_list)):
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
    #prev=None
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

'''    
from geotext import GeoText
def get_names_locations(data):
    #path='docs/sample4.txt'
    #with open(path, 'r') as myfile:
    #    data=myfile.read().replace('\n', '')
    #myfile.close()
    text=data
    #text_up=text.upper()
    s=get_continuous_chunks(text)
    for i in s:
        text=text.replace(i,'*')
    #from geotext import GeoText
    places=GeoText(text)
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
    
    return (text,locations,names)
'''
'''
Stats=''
if(loc_find==True):
    Stats+="The number of locations found are "+ str(len(locations))+" :"+str(locations)+"\n\n"
if(nam_find==True):
    Stats+="The number of names found are "+ str(len(names))+" :"+str(names)+"\n\n"        
'''
#-----------------
#-----------------------------    

def get_names_locations(data):
    #from geotext import GeoText
    #path='docs/sample4.txt'
    #with open(path, 'r') as myfile:
    #    data=myfile.read().replace('\n', '')
    #myfile.close()
    text=data
    #text_up=text.upper()
    loc=[]
    from nltk import sent_tokenize
    for i in sent_tokenize(data):
        
        chunked = ne_chunk(pos_tag(word_tokenize(i)))
        #test=0
        #print(chunked)
        for chunk in chunked:
            if hasattr(chunk, 'label') and chunk.label()=="GPE":
                s=""
                for c in chunk.leaves():
                    s+=c[0]
                loc.append(s)
    nam=[]
    for i in sent_tokenize(data):
        print(i)
        chunked = ne_chunk(pos_tag(word_tokenize(i)))
        #test=0
        #print(chunked)
        for chunk in chunked:
            if hasattr(chunk, 'label') and chunk.label()=="PERSON":
                s=""
                for c in chunk.leaves():
                    s+=c[0]
                nam.append(s)
    loc_actual=[]
    for i in loc:
        if i not in nam:
            loc_actual.append(i)
        
    s=nam+loc_actual
    #places=GeoText(text)
    for i in s:
        text_c=""
        for j in word_tokenize(i):
            c='þ'*len(j)
            c+=" "
            text_c+=c
        text_c=text_c[:-1]
        text=text.replace(i,text_c)
    li=set(loc_actual)
    lis=list(li)
    lis=sorted(lis)
    ni=set(nam)
    nis=list(ni)
    nis=sorted(nis)
    return (text,lis,nis)         
      
    #return locations



'''
'''
        
#------------    

def phones(data):
    text=data
    import re
    #text="+42 555.123.4567,+1-(800)-123-4567,+7 555 1234567,+7(926)1234567,(926) 1234567,+79261234567,9261234567,1234567,123-4567,123-89-01,495 1234567,469 123 45 67 and +918500700022"
    p=[]
    p=re.findall(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}',text)
    for i in p:
        tok="þ"*len(i)
        text=text.replace(i,tok)
    return (text,p)    
#------------------------        
'''
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
'''
'''
def address(data,l,n):
    
    x=l+n
    for i in x:
        tok="þ"*len(i)
        data=data.replace(i,tok)
        
    return data
'''
def dates(data):
    import re
    text=data
    dates=[] 
    d_1=re.findall(r'(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9][-|\/](?!1[3-9]|00)[01][0-9][-|\/](?!10|28|29)\d{2,4}',text)
    #d_2=re.findall(r'[january|february|march|april|may|june|july|august|september|october|november|december]{9}\s{0,1}\d{2,4}',text,flags=re.I)
    #d_3=re.findall(r'[sunday|monday|tuesday|wednesday|thursday|friday|saturday]{9}',text,flags=re.I)
    #d_actual=[]
    
    #for i in d_3:
       # d_actual.append(i[1:])
    l=['monday','tuesday','thursday','wednesday','friday','saturday','sunday']
    l_1=['mon','tue','thu','wed','fri','sat','sun']
    year=['january','february','march','april','may','june','july','august','september','october','november','december']
    d_2=[]
    d_3=[]
    for i in word_tokenize(text):
        if i.lower() in l:
            d_2.append(i)
    for i in word_tokenize(text):
        if i.lower() in year:
            d_3.append(i)
    for i in word_tokenize(text):
        if i.lower() in l_1:
            d_2.append(i)
            
    
    #for i in d_actual:
     #   x=i.lower()
    #for j in l:
        
    
    for i in d_1:
        dates.append(i)
    for i in d_2:
        dates.append(i)
    for i in d_3:
        dates.append(i)
    
    count_dates=len(dates)#goes to stats
    print(count_dates)
    print(dates)
    tok=""
    for i in dates:
        tok="þ"*len(i)
        text=text.replace(i,tok)
    return (text,dates)

#---------------------------------
#3. ---------Gender Replacing matching gender words with thorn characters
def get_gender(data):
    genders=['he','she','him','her','his','hers','male','female','man','woman','men','women','He','She','Him','Her','His','Hers','Male','Female','Man','Woman','Men','Women','HE','SHE','HIM','HER','HIS','HERS','MALE','FEMALE','MAN','WOMAN','MEN','WOMEN']
    #path='docs/sample3.txt'
    import nltk
    #with open(path,'r') as  myfile:
    #    data=myfile.read()
    sent=data.split('\n')
    y=''
    #stats=''
    count_gender=0
    for i in sent:
        x=[]
        x=nltk.word_tokenize(i)
        count=0
        for j in x:
            if j in genders:
                #x[count]='*'
                tok="þ"*len(j)                
                y+=tok
                y+=" "
                count_gender+=1
            else:
                y+=j
                y+=' '
            count+=1
      
        y+='\n'
    return (y,count_gender)
#------------------------------------------ 
def get_concepts(text,concept):
    #concepts=[]
    
    import re
    import nltk
    #from nltk.corpus import wordnet
    from nltk.corpus import wordnet as wn
    concept_match=[]
    for i in concept:
        x=wn.synsets(i)
        l=[]
        
        for i in x:
        	l.append(str(i))
        
        syn=[]
        #obtaining the synonms of the concepts  and using the regular expressions to extract just the synonms leaving extra syntax behind
        for i in l:
            a=re.search(r'\'(\w+)\.',i)
            syn.append(a.group(1))
      
        #sample2='Help word has many synonyms such as aid, assistant, avail, help, help_oneself, serve, avail and many other words.\nDogs are very kind animals but that statement does not hold true for each and every dog.\n As human beings we should help each others.'
        
        y=''
        #Replacing the entire content of sentences having the synonms of the concepts with the        
        for i in nltk.sent_tokenize(text):
            count=0
            temp=""
            #print(i)
            for j in nltk.word_tokenize(i):
                if j in syn:
                    count+=1
                    concept_match.append(j)
                    #print(concept_match)
                else:
                    temp+=j
                    temp+=" "
            if count>0:
                '''
                y+="þ."
                y+="\n"
                #print(y)
                '''
                tok="þ"*len(i)                
                y+=tok
                y+="\n"
            else:
                if(temp!=''):
                    y+=temp
                    y+="\n"
        y=y[:-1]
        y=y.replace(" \n","\n")
        space_li=[]
        for i in range(0,len(text)):
            if text[i]==' ':
                space_li.append(i)
        yi=''
        yl=list(y)        
        for i in range(0,len(y)):
            if i in space_li:
                yi+=' '
            else:
                yi+=yl[i]
            
                
    concept_match=sorted(concept_match)   
    return(yi,concept_match)
#-------------------------------------------------------------------------------------------
#5------printing to pdf files

import os
os.system("mkdir {0}".format(output_commands))
def get_output(data,file_name,loc):
    import os
    f_name=file_name
    '''
    f_name=file_name
    f_name=f_name.replace(".html",".txt")
    os.system("touch {0}".format(f_name))
    print(f_name)
    '''
    with open(f_name,'w',encoding="utf-8")as file:
        file.write(data)
        file.close()
    if f_name[-4:]=='.txt':
        a=f_name.split('/')
        print(a)
        f_name=a[1]
          
    f_name=f_name.replace(".html",".txt")
    fi_name=f_name.replace(".txt",".pdf")
    
    #Using Shell Script to convert to PDF FIles
    os.system("enscript {0} -o - | ps2pdf - {1}/{2}".format(f_name,loc,fi_name))
    #Stats=''
    #Stats=("The total number of redacted Files are {0} in which Html files count is {1} and Text files count is {2}".format(count_redactedFiles,count_redactedHtmlFiles,count_redactedTextFiles))
    return(glob.glob("{0}/*.pdf".format(loc)))    



    #have to return stats

#--------------------------------------------------------------------------
def getStats(lo,na,ph,dat,gen,con,stats_commands):
    import glob
    text=''
    text=("The locations obtained are redacted from the file are: {0}\n".format(lo))
    text+=("The names obtained are redacted from the file are: {0}\n".format(na))
    text+=("The phone numbers obtained are redacted from the file are: {0}\n".format(ph))
    text+=("The dates redacted from the file are:{0}\n".format(dat))
    text+=("The number of gender words  redacted from the file are: {0}\n".format(gen))
    text+=("The concepts redacted from the file are: {0}\n".format(con))
    if stats_commands[0]=="stdout":
        print("The locations obtained are redacted from the file are: {0}".format(lo))
        print("The names obtained are redacted from the file are: {0}".format(na))
        print("The phone numbers obtained are redacted from the file are: {0}".format(ph))
        print("The dates redacted from the file are:{0}".format(dat))
        print("The number of gender words  redacted from the file are: {0}".format(gen))
        print("The concepts redacted from the file are: {0}".format(con))
        
    elif stats_commands[0]=="stderr":
        if len(lo)==0:
            print("There are no locations in the file to be redacted")
        if len(na)==0:
            print("There are no names in the file to be redacted")
        if len(ph)==0:
            print("There are no phone numbers in the file to be redacted")
        if len(dat)==0:
            print("There are no dates in the file to be redacted")
        if gen==0:
            print("There are no gender words in the file to be redacted")
        if len(con)==0:
            print("There are no concepts in the file to be redacted")
    else:
        temp=stats_commands[0]
        
        import os
        os.system("mkdir {0}".format(temp))
        os.system("touch {0}/{1}".format("file","stats.txt"))
        filepath=("{0}/{1}".format("file","stats.txt"))
        with open(filepath,'w',encoding="utf-8")as file:
            file.write(text)
            file.close()
        print("Succesfully created stats.txt in {0} folder".format(temp))
    return(text)
#-------------------------------------------------------------------------------------------
    
for i in html_files:
    filename=i
    with open(i,'r', encoding="utf-8") as file:
        data=file.read()
        file.close()
    text=''
    text=data #---------------trying to collect the data between the body tags in html files
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
    (t_n_l,lo,na)=get_names_locations(t_e_1)
    (p,ph)=phones(t_n_l)#---------------------have to return in all methods
    (d,dat)=dates(p)
    (g,gen)=get_gender(d)
    (c,con)=get_concepts(g,concepts_commands)
    out=get_output(c,filename,output_commands)  
    statOut=getStats(lo,na,ph,dat,gen,con,stats_commands)



        
     



for i in text_files:
    filename=i
    text=''
    with open(i,'r', encoding="utf-8") as file: 
        data=file.read()
        text=data
        file.close()
    (t_n_l,lo,na)=get_names_locations(text)
    (p,ph)=phones(t_n_l)#---------------------have to return in all methods
    (d,dat)=dates(p)
    (g,gen)=get_gender(d)
    (c,con)=get_concepts(g,concepts_commands)
    out=get_output(c,filename,output_commands)
    statOut=getStats(lo,na,ph,dat,gen,con,stats_commands)