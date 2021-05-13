from json import *


"""
EXEMPLE:

{
    "nom_du_boss": {
        "health": 999,
        "stamina": 999,
        "lvl": 10,
        "channel_id": "channel_id",
        "zone": "zone",
        "description": "Un vilain boss de 12m de haut. Il est très laid et méchant. agrougrou",
        "attaques": [{
            "degat": 100,
            "cooldown_s": 10,
            "name":"attaque_1",
            "type":"pierre",
            "description": "nom_du_boss frappe avec ses deux points et détruit tout dans un rayons de 10m"
            },{
            "degats": 200,
            "cooldown_s": 50,
            "name":"attaque_2",
            "type":"pierre",
            "description": "nom_du_boss invoque la pierre et jsp quoi"
            }
            ]
    }
}


"""



def verifyTypeFloat(chaine):
    try:
        chaine =  float(chaine)
        return True
    except ValueError:
        print("Erreur, la variable entré n'est pas un nombre")
    return False

def main():
    infoBasiqueListINT= ("health", "stamina","lvl")
    infoBasiqueListSTR= ("name","channel_id","categorie_id","zone","description")

    infoAttaqueINT = ("degats", "cooldown_tours", "nombre_de_tour_actif","penalite_degat","penalite_precision")
    infoAttaqueSTR = ("name","description")
    typeElementaire = ('feu', 'eau', 'air', 'terre', 'tempete', 'foudre', 'sang', 'tenebres', 'lumiere', 'arcane', 'ombre', 'stellaire')

    OUTPUT = {}
    
    
    print("Generator by Aderox for The Death Game")

    nom = input("l'id du boss: ")
    OUTPUT[nom] = {}
    OUTPUT[nom]["attaques"] = []

    
    for i in infoBasiqueListINT:
        var = input(i + " (nombre): ")
        while(not verifyTypeFloat(var)):
            var = input(i + " (nombre): ")
        OUTPUT[nom][i] = float(var)

    for i in infoBasiqueListSTR:
        var = input(i + ": ")
        OUTPUT[nom][i] = var
    
    print("\ntypes: " + str(typeElementaire))
    print("\ntypes: ")
    typeBoss = input("Le type du boss: ")
    
    
    while not typeBoss in typeElementaire:
        print("Mauvais type: ")
        typeBoss = input("Le type du boss: ")
    

    OUTPUT[nom]["type"] = typeBoss

    nbAttaque = input("Le nombre d'attaques (nombre): ")
    while(not verifyTypeFloat(nbAttaque)):
        nbAttaque = input("Le nombre d'attaques: ")
    nbAttaque = int(nbAttaque)

    for j in range(0,nbAttaque):
        varF = {}
        var = {}
        print("\n--------------\nAttaque numero " + str(j+1) +" :\n")
        for i in infoAttaqueINT:
            varT = input(i + " (nombre): ")
            while(not verifyTypeFloat(varT)):
                varT = input(i + " (nombre): ")
            var[i] = float(varT)
        
        for i in infoAttaqueSTR:
            varT = input(i + ": ")
            var[i] = varT

        print("\ntypes: " + str(typeElementaire))
        print("\ntypes: ")
        typeBoss = input("Le type de l'attaque: ")
        
        while not typeBoss in typeElementaire:
            print("Mauvais type: ")
            typeBoss = input("Le type de l'attaque: ")
        
        
        var["type"] = typeBoss
        OUTPUT[nom]["attaques"].append(var)

    print("Voici la sortie: ")
    print(dumps(OUTPUT))
    fileName = input("Comment voulez vous que le fichier s'apelle: ")

    f = open(str(fileName)+".json", "w")
    f.write(dumps(OUTPUT))
    f.close()

    input("Fini ! Press any key to leave")



if __name__ == "__main__":
    main()
