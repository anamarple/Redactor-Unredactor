from redactor import redactor

lo=["USA","INDIA"]
na=["VISHNU","VIKASH"]
ph=["8500700022","405.410.5331"]
dat=["23-10-1995","23-10-1994"]
gen=2
con=["help","avail"]
stats_commands=["stdout"]


def test_function():
    (x)=redactor.getStats(lo,na,ph,dat,gen,con,stats_commands)
    
    assert x=="The locations obtained are redacted from the file are: ['USA', 'INDIA']\nThe names obtained are redacted from the file are: ['VISHNU', 'VIKASH']\nThe phone numbers obtained are redacted from the file are: ['8500700022', '405.410.5331']\nThe dates redacted from the file are:['23-10-1995', '23-10-1994']\nThe number of gender words  redacted from the file are: 2\nThe concepts redacted from the file are: ['help', 'avail']\n"
    

#-----------------------------------------------------------------------------------------------
'''
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
'''