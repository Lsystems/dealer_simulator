class Market{
    constructor(game){
        this.game=game;
        
        
        // le marché actif
        this.activeMarket='misc'; // default !='weapon' && !=''
        
        // les codes produits ou type produit sans achat max
        this.noBuyAll=['backpack','service'];
        
        // les places de marché : marketPlaces[prop] => items.type
        this.marketPlaces={
            drug:{
                displayName:'Marché noir'
                ,open:true
                ,lines:new Map()
                
            }
            ,misc:{
                displayName:'Carouf City'
                ,open:true
                ,lines:new Map()
                
            }
            ,weapon:{
                displayName:'Armurerie'
                ,open:true
                ,lines:new Map()
                
            }
        };
        
        // on abonne les achats sur évènement
        this.onEvent();
    }
    
    init(){
        this.container=this.game.UI.main;

        this.marketNode=TOOLS.createElement({
            attr:{
                id:'marketbox'
            }
            ,html:`
                <div id="marketselect"></div>
                <div id="marketplace"></div>
            `
        });
        this.container.appendChild(this.marketNode);
        
        this.selectBar=this.marketNode.querySelector('#marketselect');
        this.place=this.marketNode.querySelector('#marketplace');
        
        
        this.create();
        this.activateMarket(this.marketPlaces.drug);
    }
    
    getCurrentMarket(){
        return this.marketPlaces[this.activeMarket];
    }
    
    create(){
        
        for(let marketType in this.marketPlaces){
            let market=this.marketPlaces[marketType];
            
            // on complète l'objet
            market.type=marketType;
            market.active=marketType===this.activeMarket?true:false;
            
            // classe active
            let aC='';
            if(market.active)
                aC=' active';
            
            // les sélecteurs 
            market.selector=TOOLS.createElement({
                attr:{
                    class:'m_goto'+aC
                }
                ,html:market.displayName
            });
            
            // au click sur le sélecteur
            ((m)=>{
                m.selector.addEventListener('click',()=>{
                    this.activateMarket(m);
                });
                
            })(market);
            
            // on écrit le sélecteur
            this.selectBar.appendChild(market.selector);
            
            // le conteneur de la liste
            market.placeNode=TOOLS.createElement({
                attr:{
                    class:'mp_cont'+aC
                }
            });
            this.place.appendChild(market.placeNode);
            
            
        }
    } 
    
    activateMarket(m=false){
        let market=this.marketPlaces[this.activeMarket];
        // par défaut on créer la liste actuelle
        if(m)
            market=m;
        
        if(market.type!==this.activeMarket){
            this.inactivateMarket();
            this.activeMarket=market.type;
            
            market.selector.classList.add('active');
            if(!market.placeNode.childNodes.length){
                this.createMarketList();
            }
            market.placeNode.classList.add('active');
            market.active=true;
        }        
    }
    
    inactivateMarket(m=false){
        let market=this.getCurrentMarket();
        // par défaut on créer la liste actuelle
        if(m)
            market=m;
        
        market.selector.classList.remove('active');
        market.placeNode.classList.remove('active');
        market.active=false;
    }
    
    createMarketList(m=false){
        let market=this.getCurrentMarket();
        // par défaut on créer la liste actuelle
        if(m)
            market=m;
        
        // vente authorisé uniquement sur le marché noir
        market.authorizedSell=market.type!=='misc' && market.type!=='weapon';

        // la colonne vente
        let sellCol='';
        if(market.authorizedSell)
            sellCol=`<div class="pl_sellprice">VENTE</div>`;
        
        // le noeud de la liste et l'entête
        market.listNode=TOOLS.createElement({
            attr:{
                class:'marketlist'
            }
            ,html:`
                <div class="priceline marketheader">
                    <div class="pl_ico"></div>
                    <div class="pl_name"></div>
                    <div class="pl_buyprice">ACHAT</div>
                    ${sellCol}
                    <div class="pl_qty"></div>
                    <div class="pl_unit"></div>
                    <div class="pl_pockvol">${getSVGIcon('pocket')}</span></div>
                    <div class="pl_buy"></div>
                    <div class="pl_buya"></div>
                </div>
            `
        });       
        market.placeNode.appendChild(market.listNode);
        
        // on créer une copie de la liste du marchée
        let items=this.game.items.getItemsList([market.type]);
        
        if(items){
            for(let itemProp in items){
                this.addLine(market.type,items[itemProp]);
                // console.log(market.lines);
                
            }
        }
    }
    
    addLine(marketType,item){
        try{
            let market=this.marketPlaces[marketType];
            if(!market)
                throw 'ERROR:: Market addLine : marché inconnu';

            let ico=getSVGIcon(item.gameIco,{
               classe:'pl_icosvg' 
            });
            
            let readonly='';
            if(!this.hasBuyAllBtn(item)){
                readonly='readonly="readonly"';
            }                
            // on créer le minimum non dynamique, sans suprerflu, les méthodes dédiées s'occupe de remplir
            // /!\ une cellule = une classe 
            let line=TOOLS.createElement({
                attr:{
                    class:'priceline'
                }
                ,html:`
                    <div class="pl_ico">${ico}</div>
                    <div class="pl_name">${item.displayName}</div>
                    <div class="pl_buyprice"></div>
                    <div class="pl_sellprice"></div>
                    <div class="pl_qty"><input type="type" value="1" ${readonly}></div>
                    <div class="pl_unit">${item.unit}</div>
                    <div class="pl_pockvol"></div>
                    <div class="pl_buy"></div>
                    <div class="pl_buya"></div>
                `
            });
            
            market.lines.set(item.code,{
               node:line
               ,item:item
            });
            
            market.listNode.appendChild(line);
            this.refreshLine(market.type,item.code);
        }
        catch(e){
            TOOLS.log(e);
        }
    }
    
    removeLine(marketType,item){
        try{
            let market=this.marketPlaces[marketType];
            if(!market)
                throw 'ERROR:: Market removeLine : marché inconnu';
            
            let line=this.marketPlaces.misc.lines.get(item.code);
            if(line.node.parentNode)
                line.node.parentNode.removeChild(line.node);
        }
        catch(e){
            TOOLS.log(e);
        }
    }
    
    refreshLine(marketType,lineCode){
        try{
            let line=this.marketPlaces[marketType].lines.get(lineCode);
            if(!line)
                throw "ERROR:: La ligne n'existe pas";
            
            if(!this[marketType+'Line'])
                throw "ERROR:: Méthode inconnue pour le rendu de la ligne";
            
            // on compile un objet contenant toutes les cellules, chaque traitement se démerde ensuite
            let o={};
            for(let i=0;i<line.node.children.length;i++){
                let n=line.node.children[i];
                o[n.classList[0]]=n;
            }
            // on lance le traitement = méthode correspondante !
            this[marketType+'Line'](o,line.item);
        }
        catch(e){
            TOOLS.log(e);
        }
    }
    
    // rafraîchit tout le marché
    refresh(){
        try{
            for(let marketType in this.marketPlaces){
                let market=this.marketPlaces[marketType];
                for(let itemCode of market.lines.keys()){
                    this.refreshLine(marketType,itemCode);
                }
                
                TOOLS.log('NOTICE:: Marché mis à jour :'+marketType);
            }
        }
        catch(e){
            TOOLS.log(e);
        }
    }   
    
    /////////////// methode par type de marché : on calcul les prix à CE moment pour l'item, en cas de refresh.
    drugLine(lineNodes,item){
        // prix de vente
        item.sellPrice=this.game.cities.getPrice(item,'sell');
        console.log(item.sellPrice)
        lineNodes.pl_sellprice.innerHTML=item.sellPrice
        
        // prix d'achat
        item.buyPrice=this.game.cities.getPrice(item,'buy');
        lineNodes.pl_buyprice.innerHTML=item.buyPrice;
        
        // place dans les poches
        lineNodes.pl_pockvol.innerHTML=item.pocketVol;
        
        // bouton d'achat
        this.buyBtn(lineNodes,item);
        this.buyAllBtn(lineNodes,item);
    }
    
    miscLine(lineNodes,item){      
        
        
        if(item.code==='backpack' && this.game.current.hasBackPack){
            this.removeLine('misc',item);
            return;
        }  
        // prix d'achat
        item.buyPrice=this.game.cities.getPrice(item,'buy');
        lineNodes.pl_buyprice.innerHTML=item.buyPrice;
        
        // place dans les poches
        lineNodes.pl_pockvol.innerHTML=item.pocketVol;
        
        // bouton d'achat
        this.buyBtn(lineNodes,item);
        this.buyAllBtn(lineNodes,item);
        
        // on enlève la cellule de prix de vente
        if(lineNodes.pl_sellprice)
            lineNodes.pl_sellprice.parentNode.removeChild(lineNodes.pl_sellprice);
    }
    
    weaponLine(lineNodes,item){
        
        // munitions
        if(item.isAmmo){
            lineNodes.pl_pockvol.innerHTML=item.pocketVol;
            
            // prix d'achat
            item.buyPrice=this.game.cities.getPrice(item,'buy');
        }
        
        // prix des armes fixe
        else{
            item.buyPrice=item.basePrice;
        }
        
        // prix d'achat
        lineNodes.pl_buyprice.innerHTML=item.buyPrice;
        
        // bouton d'achat
        this.buyBtn(lineNodes,item);
        this.buyAllBtn(lineNodes,item);
        
        // on enlève la cellule de prix de vente
        if(lineNodes.pl_sellprice)
            lineNodes.pl_sellprice.parentNode.removeChild(lineNodes.pl_sellprice);
        
    }
    
    // Bouton d'achat
    buyBtn(lineNodes,item){
        let b=TOOLS.createElement({
            attr:{
                class:'pl_buyqty pl_buybtn btn'
            }
            ,html:'Acheter'
        });
        
        b.addEventListener('click',()=>{
            let qty=1;
            // sécurise l'input
            if(this.hasBuyAllBtn(item))
                qty=parseInt((lineNodes.pl_qty.querySelector('input')).value);
            
            if(qty>0)
                this.game.items.buy(item,qty);
        });
            
        // vide et remplit
        lineNodes.pl_buy.innerHTML='';
        lineNodes.pl_buy.appendChild(b);
    }
    
    // bouton Achat Max
    buyAllBtn(lineNodes,item){
        if(this.hasBuyAllBtn(item)){
            let maxAmnt=()=>`Ach. max (${this.getMaxBuy(item)})`;
            let b=TOOLS.createElement({
                attr:{
                    class:'pl_buyall pl_buybtn btn'
                }
                ,html:maxAmnt()
            });
            
            b.addEventListener('click',()=>{
                if(qty>this.getMaxBuy(item))
                    this.game.items.buy(item,qty);        
            });
                                
            // vide et remplit
            lineNodes.pl_buya.innerHTML='';
            lineNodes.pl_buya.appendChild(b);
        }
    }
    
    // renvoi l'autorisation de bouton Achat max
    hasBuyAllBtn(item){
        return this.noBuyAll.indexOf(item.code)<0 && this.noBuyAll.indexOf(item.type)<0;
    }
    
    // renvoi le max d'achat pour un item
    getMaxBuy(item){
        try{
            let isNotAGun=item.type==='weapon' && item.isAmmo || item.type!=='weapon';
            let amnt=0;
            
            // la place restante dans les poches
            if(isNotAGun && item.pocketVol!==0){
                let cap=this.game.getPocketCapacity();
                
                console.log(item.code,cap,item.pocketVol)
                amnt=Math.floor(cap/item.pocketVol);
            }

            // armes
            if(!isNotAGun){
                amnt=this.game.getWeaponPocketCapacity()-this.game.current.weaponPocketAmnt;
            }
            
            // le max qu'on puisse s'acheter avec l'argent
            let moneyMax=Math.floor(this.game.current.money/item.buyPrice);
            
            // si a pas assez d'argent pour remplir les poches, on achète ce qu'on peut au max
            if(amnt > moneyMax)
                amnt=moneyMax;
            
            return amnt;
        }
        catch(e){
            TOOLS.log('ERROR:: calcul achat max');
            TOOLS.log(e);
        }        
    }
   

    onEvent(){
        
        // librairie d'action spécifique par item pour gérer l'interface
        let actionOnItem={
            // sac à dos
            backpack:(item)=>{
                let line=this.marketPlaces.misc.lines.get('backpack');
                line.node.parentNode.removeChild(line.node);
                this.game.current.hasBackPack=true;
                this.game.obs.trigger('buyBackPack');
            }
        }
        
        // à l'achat d'un item
        this.game.obs.sub('buyItem',(item)=>{
            if(typeof actionOnItem[item.code]==='function'){
                actionOnItem[item.code](item);
            }
        });
        
        this.game.obs.sub('pocketsRefreshed',()=>{
            this.refresh();
        });

        // au changement d'une ville
        this.game.obs.sub('enterCity',()=>{
            this.refresh();
        });

        // quand la bourse se met a jour
        this.game.obs.sub('bourse:update', () => this.refresh())
    
    }


       
} // end of class