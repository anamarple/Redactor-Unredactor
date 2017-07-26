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
from nltk import ne_chunk, pos_tag, word_tokenize,sent_tokenize
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
def	get_entity(text):
    for sent in	sent_tokenize(text):
        for chunk in	ne_chunk(pos_tag(word_tokenize(sent))):
            if hasattr(chunk, 'label') and	chunk.label() == 'PERSON':
                c='	'.join(c[0] for	c in chunk.leaves())
                return c

'''



#-----------------------------    
from geotext import GeoText
def get_names_locations(data):
    #path='docs/sample4.txt'
    #with open(path, 'r') as myfile:
    #    data=myfile.read().replace('\n', '')
    #myfile.close()
    text=data
    #text_up=text.upper()
    s=get_continuous_chunks(text)
    places=GeoText(text)
    for i in s:
        text_c=""
        for j in word_tokenize(i):
            c='þ'*len(j)
            c+=" "
            text_c+=c
        text_c=text_c[:-1]
        text=text.replace(i,text_c)
    #from geotext import GeoText
    
    
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
    #names_not=[]
    for i in s:
        if i not in locations:
            names.append(i)
        #else:
        #    names_not.append(i)
    
    names_actual=[]
    
    
    
    from nltk import ne_chunk
    for i in names:
        
        chunked = ne_chunk(pos_tag(word_tokenize(i)))
        #test=0
        #print(chunked)
        for chunk in chunked:
            if hasattr(chunk, 'label') and chunk.label()=="GPE":
                s=""
                for c in chunk.leaves():
                    s+=c[0]
                locations.append(s)
    #return locations
    for i in names:
        if i not in locations:
            names_actual.append(i)                
                
    
    return text         
      
    #return locations
#-------------------------------------------------------------------

def phones(data):
    text=data
    import re
    #text="+42 555.123.4567,+1-(800)-123-4567,+7 555 1234567,+7(926)1234567,(926) 1234567,+79261234567,9261234567,1234567,123-4567,123-89-01,495 1234567,469 123 45 67 and +918500700022"
    p=[]
    p=re.findall(r'\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4}',text)
    #print(p)
    count_phoneNum=len(p)#Goes for Stats 
    print(count_phoneNum)
    print(p)
    for i in p:
        tok="þ"*len(i)
        text=text.replace(i,tok)
    return text      
#------------------------        
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
#3. ---------Gender
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
                count_gender+=1 #---goes to stats
            else:
                y+=j
                y+=' '
            count+=1
      
        y+='\n'
    return y
#-----------------------------------------------------------------------
def get_concepts(text,concept):
    #concepts=[]
    
    import re
    import nltk
    #from nltk.corpus import wordnet
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
        		y+='*.'
        		tmp=str(count_line)
        		stats+=" Word(s): "+temp+" present so redacted the sentence "+tmp+"\n"
        	else:
        		if(s!=''):
        			y+=s
        			y+='\n'
        	count_line+=1
         
#------------------------------------------------------------------
def get_stats(commands):
    for i in commands:
        if i=="stdout":
            print(data)
        elif i=="stderr":
            print(data_err)
        else:
            import os            
            os.system("mkdir {0}".format(i))
            os.system("cd {0}".format(i))
            os.system("touch stats.txt")
            with open("stats.txt",'w',encoding="utf-8") as file:
                #file=stats
                file.close()
#-------------------------------------------------------------
            
#5------printing to pdf files
def get_output(loc):
    import os
    count_redactedFiles=0
    count_redactedHtmlFiles=len(html_files)
    count_redactedTextFiles=len(text_files)
    count_redactedFiles=count_redactedHtmlFiles+count_redactedTextFiles
    os.system("mkdir {0}".format(loc))
    output_name=[]
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
#-----------------------------------------------------------------------
'''def get_download(text):
    import os
    count_redactedFiles=0
    os.system("mkdir {0}".format(text))
    for i in range(0,count_redactedFiles):
    
        os.system("enscript my_text_file.txt -o - | ps2pdf - output.pdf")
'''        
#-----------------------------------------------------------------      
   
for i in html_files:
    with open(i,'r', encoding="utf-8") as file:
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
    l=get_names_locations(t_e_1)
    
    #print(t_n_l)
    print(l)
            
    
    p=phones(l)#---------------------have to return in all methods
    d=dates(p)
    g=get_gender(d)
    c=get_concepts(g,concepts_commands)
    get_output(output_commands)
    get_stats(stats_commands)
    '''
    print(len(t_e_1))
    print(len(n))        
    '''