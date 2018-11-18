class Items{
    constructor(game){
        this.game=game;
        this.sellsForbidden=[
            'misc'
            ,'weapon'
        ];
        
        
        // item.type = le code marché sur lequel on le trouvera
        this.items={
            // Drogues
            drug:{
                weed:{
                    displayName:"Weed"
                    ,basePrice:9.5
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'weed'
                    ,pocketVol:3
                    ,gameIco:'weed' // ref to /assets/gamicons.js
                }
                ,shit:{
                    displayName:"Shit"
                    ,basePrice:6.25
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'shit'
                    ,pocketVol:2
                    ,gameIco:'shit'
                    
                }
                ,mushroom:{
                    displayName:"Champignons"
                    ,basePrice:20
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'mushroom'
                    ,pocketVol:2
                    ,gameIco:'mushroom'
                    
                }
                ,meth:{
                    displayName:"Crystal Meth"
                    ,basePrice:35
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'meth'
                    ,pocketVol:1
                    ,gameIco:'crystal'
                    
                }
                ,lsd:{
                    displayName:"LSD"
                    ,basePrice:10
                    ,unit:'blot'
                    ,type:'drug'
                    ,code:'lsd'
                    ,pocketVol:0.5
                    ,gameIco:'lsd'
                    
                }
                ,cocain:{
                    displayName:"Cocaïne"
                    ,basePrice:50
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'cocain'
                    ,pocketVol:1
                    ,gameIco:'cocain'
                    
                }
                ,xtc:{
                    displayName:"Ecstasy"
                    ,basePrice:12
                    ,unit:'pill'
                    ,type:'drug'
                    ,code:'xtc'
                    ,pocketVol:0.5
                    ,gameIco:'ecstasy'
                    
                }
                ,heroin:{
                    displayName:"Heroïne"
                    ,basePrice:90
                    ,unit:'g'
                    ,type:'drug'
                    ,code:'heroin'
                    ,pocketVol:1
                    ,gameIco:'heroin'
                    
                }
            }
            
            // produits Mini-market
            ,misc:{
                flour:{
                    displayName:"Farine"
                    ,basePrice:1
                    ,unit:'kg'
                    ,type:'misc'
                    ,code:'flour'
                    ,pocketVol:4
                    ,gameIco:'flour'
                    
                }
                ,egg:{
                    displayName:"Œuf"
                    ,basePrice:0.15
                    ,unit:'egg'
                    ,type:'misc'
                    ,code:'egg'
                    ,pocketVol:1
                    ,gameIco:'egg'
                    
                }
                ,sugar:{
                    displayName:"Sucre"
                    ,basePrice:1.60
                    ,unit:'kg'
                    ,type:'misc'
                    ,code:'sugar'
                    ,pocketVol:4
                    ,gameIco:'cocain'
                    
                }
                ,chocolat:{
                    displayName:"Chocolat"
                    ,basePrice:2.50
                    ,unit:'tab'
                    ,type:'misc'
                    ,code:'chocolat'
                    ,pocketVol:2
                    ,gameIco:'chocolat'
                    
                }
                ,butter:{
                    displayName:"Beurre"
                    ,basePrice:1.40
                    ,unit:'250g'
                    ,type:'misc'
                    ,code:'butter'
                    ,pocketVol:2
                    ,gameIco:'butter'
                    
                }
                ,backpack:{
                    displayName:"Sac à dos"
                    ,basePrice:500
                    ,unit:''
                    ,type:'misc'
                    ,code:'backpack'
                    ,pocketVol:0
                    ,gameIco:'backpack'
                    
                }
            }
            
            // armes
            ,weapon:{
                bbbat:{
                    displayName:"Batte de Base-ball"
                    ,basePrice:80
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'bbbat'
                    ,gameIco:'bbbat'
                }
                ,knife:{
                    displayName:"KA-BAR"
                    ,basePrice:150
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'knife'
                    ,gameIco:'knife'
                }
                
                ,handgun:{
                    displayName:"P938"
                    ,basePrice:850
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'handgun'
                    ,mag:7
                    ,ammu:'c9mm'
                    ,gameIco:'gun'
                }
                
                ,machinegun:{
                    displayName:"AR15"
                    ,basePrice:1750
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'machinegun' 
                    ,mag:30
                    ,ammu:'nato228'
                    ,gameIco:'machgun'
                }
                
                ,shotgun:{
                    displayName:"M4 H20"
                    ,basePrice:2260
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'shotgun'
                    ,mag:6
                    ,ammu:'cal12'
                    ,gameIco:'shotgun'
                }
                
                ,c9mm:{
                    displayName:"Cartouche 9mm"
                    ,basePrice:2
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'c9mm'
                    ,isAmmo:true
                    ,pocketVol:1
                    ,gameIco:'bullet'
                }
                
                ,cal12:{
                    displayName:"Cartouche Cal.12"
                    ,basePrice:2
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'cal12'
                    ,isAmmo:true
                    ,pocketVol:1
                    ,gameIco:'cal12'
                }
                
                ,nato228:{
                    displayName:"Cartouche 5.56"
                    ,basePrice:7.5
                    ,unit:'pce'
                    ,type:'weapon'
                    ,code:'nato228'
                    ,isAmmo:true
                    ,pocketVol:1 
                    ,gameIco:'bullets'
                }
            }
        };
        
        
    } // end constructor
    
    buy(item,qty){
        
        let total=item.buyPrice*qty;
        let totalVol=item.pocketVol*qty;
        
        //////////// les conditions d'achat
        
        // assez d'argent
        let haveEnoughMoney=total<this.game.current.money;
        // ce n'est pas un flingue
        let isNotAGun=item.type==='weapon' && item.isAmmo || item.type!=='weapon';
        // il reste de la place dans les poches
        let leftEmptySpace=(this.game.getPocketCapacity()-(totalVol+this.game.current.pocketAmnt))>=0;
        
        // si on a assez d'argent et qu'on peut le mettre dans le panier
        if(haveEnoughMoney && ((isNotAGun && leftEmptySpace) || !isNotAGun)){
            
            // on soustrait la transaction au total
            this.game.current.money-=total;

            // gère les poches
            if(isNotAGun){
                this.game.current.pocketAmnt+=totalVol;
            }
            
            
            let buyedItem={
                city:this.game.current.city
                ,timestamp:this.game.current.timeSlice
                ,buyTime:this.game.todayPosix
                ,price:item.buyPrice
                ,qty:qty
                ,code:item.code
                ,type:item.type
                ,totalVol:totalVol
                ,pocketVol:item.pocketVol
                ,isToSell:true
            };
            console.log(buyedItem);
            // on met le pochon dans le panier
            this.game.obs.trigger("buyItem",buyedItem);
            return true;
        }
        
            // console.log('achat nok, raison : '+reason);
        // raison de non achat, dans l'ordre du moins important au plus important
        if(!haveEnoughMoney)
            this.game.obs.trigger("notEnoughMoneyToBuy");
        
        if(haveEnoughMoney && isNotAGun && !leftEmptySpace)
            this.game.obs.trigger("notPocketMoneyToBuy");
        
        
        return false;
    }
    
    getProfit(item,qty){
        try{
            let itemCost=(item.qty*item.price).toFixed(2);
            let currEqCost=this.game.cities.cities[this.game.current.city].currentPrices.sell[item.code]*item.qty;
            return parseFloat((currEqCost-itemCost).toFixed(2));
        }
        catch(e){
            TOOLS.log(e);
        }
    } 
    
    sell(dynaCartItem,qty){
        try{
            // les données produit
            let item=dynaCartItem.getItem();
            console.log(item)
            // calcul du prix de vente selon la ville
            let price=this.game.cities.cities[this.game.current.city].currentPrices.sell[item.code];
            
            // le profit unitaire
            let unitProfit=this.getProfit(item);
            
            // si ce qu'on essaye de vendre est possible en quantité dispo sur le pochon
            if(qty<=item.qty){
            
                // on inscrit le profit moyen de vente du produit
                if(!item.averageProfit){
                    item.averageProfit=unitProfit;
                }else{
                    item.averageProfit=((item.averageProfit+unitProfit)/2).toFixed(2);
                }
                // prix total
                let totalPrice=price*qty;
                
                // on diminue la quantité
                item.qty-=qty;
                
                // on ajoute le résultat de la vente au total
                this.game.current.money+=totalPrice;
                
                // si on gère les poches
                if(item.pocketVol){
                    let totalVol=item.pocketVol*qty;
                    this.game.current.pocketAmnt-=totalVol;
                }
                
                
                this.game.obs.trigger("sellItem",dynaCartItem);
                return
            }
            
            // on alerte de la trop grande quantité
            this.game.obs.trigger("itemOversell");
        }
        catch(e){
            TOOLS.log(e);
        }
    }
    

    
    getItemsList(cat=false){
        let it;
        if(cat && this.items[cat]){
            it=this.items[cat];
        }
        let o=TOOLS.cloneObject(it);
        return o;
    }
}