require 'json'

corpora_path = "/Users/gilmae/Projects/corpora/"

verbs = File.open("#{corpora_path}data/words/verbs.json") {|f| JSON.parse(f.read)}
adjectives = File.open("#{corpora_path}data/words/adjs.json") {|f| JSON.parse(f.read)}
objects = File.open("#{corpora_path}data/objects/objects.json") {|f| JSON.parse(f.read)}

verb_index = rand() * verbs["verbs"].length
adjective_index = rand() * adjectives["adjs"].length
object_index = rand() * objects["objects"].length

p "#{adjectives["adjs"][adjective_index]} #{objects["objects"][object_index]} of #{verbs["verbs"][verb_index]["present"]}ing"
