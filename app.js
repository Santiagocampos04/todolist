//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require ("mongoose");
const _=require("lodash");


//correr en consola1: mongod,
//       en consola2: mongo,
//     node consola3: app.js 


//es bueno  en mongo: db.lists.drop() para borrar las listas pre existentes!

//MongoDB Atlas
//pass:San35597243
//user:admin-Sancb

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//
//mongodb://localhost:27017/todolistDB
//mongodb+srv://admin-Sancb:<password>@cluster0-91afm.mongodb.net/test?retryWrites=true&w=majority
//"reemplazar contraseña (San35597243)" y despues del"/" que DB.. en este caso todolistDB

mongoose.connect("mongodb+srv://admin-Sancb:San35597243@cluster0-91afm.mongodb.net/todolistDB",
{
  useNewUrlParser: true,
  useUnifiedTopology: true
}


);

const itemsSchema={
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 =new Item( {
name:"welcolme to your to do list "
});

const item2 =new Item( {
  name:"hit the button + to add the new item "
  });

  const item3 =new Item( {
    name:"<-- Hit this to delete an item. "});

const defaultItems =[item1,item2,item3];
const listSchema={name:String,
items:[itemsSchema]
};

const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {
Item.find({},function(err,foundItems){
    
  if(foundItems.length===0){
    //si no hay elementos en la base de datos agrega los datos por default
    Item.insertMany(defaultItems, function(err,docs){
      if(err){console.log(err)
        } else {
          console.log("All succesfully done")
        }});
        res.redirect("/");
  } else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});

  }
  
  

  });
  

 

});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //Here we create a new List
      const list =new List ({
        name:customListName,
        items:defaultItems
      });
        list.save();
        res.redirect("/"+customListName);
     
    } else {
      
      //show existing List
res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
  }
   }
});

})

app.post("/", function(req, res){
 const itemName=req.body.newItem;
 const listName=req.body.list;
const item= new Item ({name:itemName});

if(listName==="Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name:listName},function(err,foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);
  });
}

 
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if (listName==="Today") {
    Item.findByIdAndDelete(checkedItemId,function(err){
      if(!err){console.log("successfully removed");
      res.redirect("/");
    }});
  }else {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
res.redirect("/"+listName);

      }
    })
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

app.listen(port, function() {
  console.log("Server started Successfully");
});
