
'''

d1=[]
d2=[]
result=1 - spatial.distance.cosine(d2, d2)
'''


# -*- coding: utf-8 -*-
"""
Created on Mon Apr 24 12:35:42 2017

@author: vishnu
"""

# -*- coding: utf-8 -*-
"""
Created on Mon Apr 24 02:31:29 2017

@author: vishnu
"""

import glob
import io
import os
import pdb
import sys
import nltk
from	nltk import sent_tokenize
from	nltk import word_tokenize
from	nltk import pos_tag
from	nltk import ne_chunk
from scipy import spatial
from operator import itemgetter

#TRAINING OF DATA happens here----------------------------------------
def	get_entity(text):
    persons=[]
    for sent in	sent_tokenize(text):
        from nltk import word_tokenize
        x=word_tokenize(sent)
        for chunk in ne_chunk(pos_tag(x)):
            if hasattr(chunk, 'label') and	chunk.label() == 'PERSON':
                #print(chunk.label(),' '.join (c[0] for c in chunk.leaves()))                
                s=""
                for c in chunk.leaves():
                    s+=c[0]
                    s+=" "
                persons.append(s[:-1])
    person_set=set(persons)
    person_l=list(person_set)
    #print(person_l)
    person_l=sorted(person_l,key=len,reverse=True)
    import nltk
    from nltk import word_tokenize
    word=word_tokenize(text)
    word_count=len(word)
    c=0
    temp=""
    temp=text
    for i in person_l:
        temp=temp.replace(i,"*")
    c=temp.count("*")
   
    
    vector_dict=[]
    for i in person_l:
        vector_file=[]
        vector_list=[]
        vector_list.append(i)
        '''        
        import re
        count = sum(1 for _ in re.finditer(r'\b%s\b' % re.escape(i),text))
        #count=len(text.split(i))-1        
        print(count)
        '''
        vector_file.append(c)#feature1
        count_space=0
        for j in i:
            if j==" ":
                count_space+=1
        vector_file.append(count_space)#feature2
        temp=i
        temp=temp.replace(" ","")
        length=len(temp)
        vector_file.append(length)#feature3
        vector_file.append(word_count)#feature4
        vector_list.append(vector_file)
        vector_dict.append(vector_list)
    #d=dict(vector_dict)
    #print(vector_dict)
    #print("Inside entity")
    return vector_dict
                    
                #print(persons)
                
def doextraction(glob_text):
    d=[]
    count=0
    for thefile in glob.glob(glob_text):
        count+=1
        with io.open(thefile,'r',encoding="utf-8") as file:
            text=file.read()
            x=get_entity(text)
            for i in x:
                d.append(i)
    return (d,count) # trained date
            #d.append(x)
    #print(d)
    #dict_features=dict(d)
    #print(dict_features)
    #print("Inside DoExtraction")
'''
from scipy import spatial
d1=[]
d2=[]
result=1 - spatial.distance.cosine(d2, d2)
'''

#-----------------------------REDACTING NAMES OF PERSONS in the test data files PHASE
def get_redacted_entity(text):
    persons=[]
    for sent in	sent_tokenize(text):
        from nltk import word_tokenize
        x=word_tokenize(sent)
        for chunk in ne_chunk(pos_tag(x)):
            if hasattr(chunk, 'label') and	chunk.label() == 'PERSON':
                #print(chunk.label(),' '.join (c[0] for c in chunk.leaves()))                
                s=""
                for c in chunk.leaves():
                    s+=c[0]
                    s+=" "
                persons.append(s[:-1])
    #count=len(persons)            
    person_set=set(persons)
    person_l=list(person_set)
    #print(persons)
    person_l=sorted(person_l,key=len,reverse=True)
    return person_l
        
                
                
                
def doextract(glob_text):
    for thefile in glob.glob(glob_text):
        with io.open(thefile,'r',encoding="utf-8") as file:
            text=file.read()
            redact_person=get_redacted_entity(text)
            file.close()
        import nltk
        with io.open(thefile,'w',encoding="utf-8")as file:
            #print(redact_person)
            for i in redact_person:
                temp=""
                for j in nltk.word_tokenize(i):
                    temp+="*"*len(j)
                    temp+=' '
                temp=temp[:-1]
                text=text.replace(i,temp)
            file.write(text)
            file.close()
#------------------------------------------------------------------------------------------------
#Prediction of Names Phase
def get_feature_redacted(text):
    feature=[]
    w=0            
    w=len(nltk.word_tokenize(text))
    count=0
    space=0
    count_word=0
    count_Redacted=0   
    l=[]
    for i in range(0,len(text)):
        if text[i]=="*":
            count_word=1
            count+=1
            #if text[i+1]==" " and text[i+2]=="*":
                #i=i+1
                #space+=1
        else:
            if text[i-1]=="*" and text[i+1]=="*":
                #i=i+1
                space+=1
                continue
            if count>0:
                if space>=0:
                    l.append(space)
                l.append(count)
                l.append(w)
                feature.append(l)
                l=[]
            count=0     
            space=0
            if count_word==1:
                count_Redacted+=1
                count_word=0
        #print(i)
    #print(count_Redacted)
    #print(feature)
    feature_actual=[]
    for i in feature:
        l=[]
        l.append(count_Redacted)
        for j in i:
            l.append(j)
        feature_actual.append(l)
    #print(feature_actual)
    return feature_actual       
    
   # feature.append()
def cos_similar(v1,v2):
    result=1 - spatial.distance.cosine(v1, v2)
    return result               
                
               
def doprediction(glob_text, trainData):
    for thefile in glob.glob(glob_text):
        with io.open(thefile,'r',encoding="utf-8") as file:
            text=file.read()
            feat_redact=get_feature_redacted(text)
            file.close()
            td=trainData
            fd=feat_redact
            #sim=[]
            sim_fd=[]
            count=0
            for i in fd:
                vec=[]
                count+=1
                vec.append(count)
                sim=[]
                x=[]
                for j in td:
                    temp=[]
                    temp.append(j[0])
                    temp.append(cos_similar(i,j[1]))
                    sim.append(temp)
                sim=sorted(sim,key=itemgetter(1),reverse=True)
                for i in range(0,3):
                    x.append(sim[i])
                vec.append(x)
                sim_fd.append(vec)
        for i in sim_fd:
            print("The top three most likely word for the {0} redacted word in file are: {1}\n".format(i[0],i[1]))
        if len(sim_fd)==0:
            print("There are no person names in the file!!")
       #with io.open(thefile,'w',encoding="utf-8")as file:
            
                
                
        '''    
        import nltk
        with io.open(thefile,'w',encoding="utf-8")as file:
            print(redact_person)
            for i in redact_person:
                temp=""
                for j in nltk.word_tokenize(i):
                    temp+="*"*len(j)
                    temp+=' '
                temp=temp[:-1]
                text=text.replace(i,temp)
            file.write(text)
            file.close()            
        '''
















#---------------------------------------------------------------------------------------------------
if __name__=='__main__':
    #	Usage:	python3	unredactor.py	'train/pos/*.txt'

    #training Data Phase
    (trainData,count_TrainFiles)=doextraction(sys.argv[-1])
    
    #Redacting the Person Names of Test Data Phase
    doextract('dt/*.txt')
    

    #Predicting the names of the Persons 
    doprediction('dt/*.txt',trainData)   
    
    
    #s="Bromwell High is a cartoon comedy. It ran at the same time as some other programs about school life, such as 'Teachers'. My 35 years in the teaching profession lead me to believe that Bromwell High's satire is much closer to reality than is 'Teachers'. The scramble to survive financially, the insightful students who can see right through their pathetic teachers' pomp, the pettiness of the whole situation, all remind me of the schools I knew and their students. When I saw the episode in which a student repeatedly tried to burn down the school, I immediately recalled ......... at .......... High. A classic line: INSPECTOR: I'm here to sack one of your teachers. STUDENT: Welcome to Bromwell High. I expect that many adults of my age think that Bromwell High is far fetched. What a pity that isn't! for Bromwell High"               
    #s1="If you like adult comedy cartoons, like South Park, then this is nearly a similar format about the small adventures of three teenage girls at Bromwell High. Keisha, Natella and Latrina have given exploding sweets and behaved like bitches, I think Keisha is a good leader. There are also small stories going on with the teachers of the school. There's the idiotic principal, Mr. Bip, the nervous Maths teacher and many others. The cast is also fantastic, Lenny Henry's Gina Yashere, EastEnders Chrissie Watts, Tracy-Ann Oberman, Smack The Pony's Doon Mackichan, Dead Ringers' Mark Perry and Blunder's Nina Conti. I didn't know this came from Canada, but it is very good. Very good!"    
    #get_entity(s1)    
    #print(sys.argv[-1]) 