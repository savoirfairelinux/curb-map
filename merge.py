import json

ls = [
    "mtl-fusion-plaza.curblr.json",
    "mtl-parco-plaza.curblr.json",
    "mtl-subset-segment-plaza.curblr.json"
]
 
PATH = "src/assets/data/"
with open(PATH + ls[1], "r") as f1, open(PATH + ls[2], "r") as f2:
    signalec = json.load(f1)
    parco = json.load(f2)
    data = signalec
    data["features"] = signalec["features"] + parco["features"]
    with open(PATH + ls[2].replace("subset", "fusion").replace("segment-", ""), "w") as f3:
        json.dump(data, f3)