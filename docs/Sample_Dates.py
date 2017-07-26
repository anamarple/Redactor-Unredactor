# -*- coding: utf-8 -*-
"""
Created on Tue Apr  4 00:05:55 2017

@author: vishnu
"""


#text=''

#a=re.search(r'\'(\w+)\.',i)
def phones(data):
    text=data
    import re
    text="+42 555.123.4567,+1-(800)-123-4567,+7 555 1234567,+7(926)1234567,(926) 1234567,+79261234567,9261234567,1234567,123-4567,123-89-01,495 1234567,469 123 45 67 and +918500700022"
    p=[]
    p=re.findall(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}',text)
    for i in p:
        text=text.replace(i,'*')
    return text


#dates 
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

#-------------------------------------------------------------HTML
import glob
a=glob.glob('*.html')
i=''
i=a[0]

with open(i,'r') as file:
    data=file.read()
text=''
text=data
#import re
#a=re.search(r'<body>(.*)</body>',text)
#a.group(1)

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
        
