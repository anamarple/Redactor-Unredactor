from nltk import ne_chunk, pos_tag, word_tokenize
from nltk.tree import Tree

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

path='sample4.txt'
with open(path, 'r') as myfile:
    data=myfile.read().replace('\n', '')
myfile.close()
text=data
text_up=text.upper()
s=get_continuous_chunks(text)
print(s)
s_str=str(s)
from geotext import GeoText
places=''
places=GeoText(s_str)
locations=places.cities

names=[]
for i in s:
    if i not in locations:
        names.append(i)

Stats=''
loc_find=True
nam_find=True
if(loc_find==True):
    Stats+="The number of locations found are "+ str(len(locations))+" :"+str(locations)+"\n\n"
if(nam_find==True):
    Stats+="The number of names found are "+ str(len(names))+" :"+str(names)+"\n\n"

print(Stats)