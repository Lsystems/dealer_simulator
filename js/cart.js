class Cart{
    constructor(game){
        this.game=game;
        // le panier dynamique : ça n'est pas le panier officiel => this.game.current.cart
        // cet objet sert de référence au tableau maître
        this.dynaCart=[];
        this.noCartAllowed=['backpack'];
        this.onEvent();
    }
    
    init(){
        this.container=this.game.UI.main;

        this.cartNode=TOOLS.createElement({
            attr:{
                id:'cart'
            }
        });
        this.container.appendChild(this.cartNode);
    }

    
    isCartAllowed(item){
        return this.noCartAllowed.indexOf(item.code)<0 && this.noCartAllowed.indexOf(item.type)<0;
    }
    isSellAllowed(item){
        return item.type!=='misc' && item.type!=='weapon';
    }
    // renvoi la même tranche de temps dans la même ville
    trySellInSameTimeSlice(item){
        return parseInt(item.timestamp)===parseInt(this.game.current.timeSlice) && item.city===this.game.current.city;
    }

    onEvent(){
        // à l'achat d'un item
        this.game.obs.sub('buyItem',(item)=>{
            this.addItem(item);
        });
        
        // à la vente d'un item
        this.game.obs.sub('sellItem',(dynaCartItem)=>{
            this.deleteFromCart(dynaCartItem);
        });
        
        // au changement d'une ville
        this.game.obs.sub('enterCity',()=>{
            this.refreshCart();
        });
    }
        
 /* item {
     city:this.game.current.city
    ,timestamp:this.game.current.timeSlice
    ,buyTime:this.game.todayPosix
    ,price:item.buyPrice
    ,qty:qty
    ,code:item.code
    ,type:item.type
    ,totalVol:totalVol
 }
 */   
    addItem(item){
        try{
            if(!item)
                throw 'ERROR:: Cart AddItem @param item requis';
            
            let itemDB=this.game.items.items[item.type][item.code];
            if(!itemDB)
                throw 'ERROR:: Cart AddItem base de donnée produit indéfinie';
            
            // si pas a vendre ou pas à mettre dans le panier, on sort
            if(!item.isToSell || !this.isCartAllowed(item)){
                return;
            }
            
            // on ajoute l'item au panier référence du jeu
            let cartIndex=(this.game.current.cart.push(item))-1;
            
            // on créer l'entrée dans le panier dynamique
            this.dynaCart.push({
                itemIndex:cartIndex
                ,getItem:()=>this.game.current.cart[cartIndex]
                ,type:item.type
                // ,isHidden:false
            });
            
            let dynaCartItem=this.dynaCart[cartIndex];
                     
            
            // nom de la ville
            let city=this.game.cities.cities[item.city];
            let cityName=city.displayName;

            // date d'achat d'achat
            let d=this.game.userFriendlyTime(item.buyTime);
            
            // Total crédits
            let totalCR=(item.qty*item.price).toFixed(2);
            

            
            // classe du liseret coloré
            let cartPColor=` cp_cpc_${item.type}`;
                        
            let iNode=TOOLS.createElement({
                attr:{
                    class:'cart_prod'+cartPColor
                }
            });            
            iNode.innerHTML=`
                
                <div class="cp_phead">
                    <div class="cph_itemname">${itemDB.displayName}</div> 
                    <div class="cph_itemcost">${totalCR} Cr.</div>
                    <div class="cph_headaction">
                        <div class="cp_habtn cp_delfromcart fas fa-trash"></div>
                    </div>
                </div>
                
                <div class="cp_numbs">
                    <div class="cp_mon">${item.qty} ${itemDB.unit} x ${item.price} Cr.</div>
                    <div class="cp_weig">${getSVGIcon('pocket')} <span class="cpw_tv"></span></div>
                </div>
                <div class="cp_info">
                    <div class="cp_cityname">${cityName}<br>${d}</div>
                    <div class="cp_profit"></div>
                </div>
                <div class="cp_action">
                    <div class="cp_sellqty">
                        <input type="text" value="1">
                    </div>
                    <div class="cpa_btn"></div>
                </div>
            `;                        
            
            // this.game.current.cart[i].node=pNode;
            this.cartNode.appendChild(iNode);
            dynaCartItem.node=iNode;
            this.refreshItem(dynaCartItem);
        }
        catch(e){
            TOOLS.log(e);
        }
    }
    
    refreshCart(){
        for(let i=0,len=this.dynaCart.length;i<len;i++){
            let item=this.dynaCart[i].getItem();
            if(item.isToSell)
                this.refreshItem(this.dynaCart[i]);
        }
    }
    
    refreshItem(dynaCartItem){
        
        let item=dynaCartItem.getItem();
        if(this.isSellAllowed(item)){
            this.refreshProfit(dynaCartItem);
        }
        if(item.pocketVol){
            this.refreshPocketTotalVolum(dynaCartItem);
        }
        
        this[dynaCartItem.type+'Action'](dynaCartItem);
    }
    
    refreshProfit(dynaCartItem){
        let item=dynaCartItem.getItem();
        let node=dynaCartItem.node.querySelector('.cp_profit');
        let p=this.game.items.getProfit(item);
        // style pour le negatif
        let neg=p<0?' neg':'';
        node.innerHTML=`Profit : <span class="cpp_way${neg}">${p} Cr.</span>`;
    }
    
    refreshPocketTotalVolum(dynaCartItem){
        let item=dynaCartItem.getItem();
        let tv=item.qty*item.pocketVol;
        let node=dynaCartItem.node.querySelector('.cpw_tv');
        node.innerHTML=tv;
    }
    
    drugAction(dynaCartItem){
        let item=dynaCartItem.getItem();
        let node=dynaCartItem.node.querySelector('.cpa_btn');
        node.innerHTML='';
        let qtyInp=dynaCartItem.node.querySelector('.cp_sellqty input');

        // Bouton vente inactif sur la même tranche de temps dans la même ville
        let inactiveClass='';
        if(this.trySellInSameTimeSlice(item)){
            inactiveClass=' inactive';
        }
        
        // Bouton vendre
        let sellBtnQty=TOOLS.createElement({
            attr:{
                class:`cp_sellbtn btn${inactiveClass}`
            }
            ,html:'Vendre'
        });
        
        node.appendChild(sellBtnQty);
        
        sellBtnQty.addEventListener('click',()=>{
            if(!this.trySellInSameTimeSlice(item))
                this.game.items.sell(dynaCartItem,parseInt(qtyInp.value));
        });        
        
        // Bouton Tout Vendre
        let sellBtnQtyAll=TOOLS.createElement({
            attr:{
                class:`cp_sellbtn btn${inactiveClass}`
            }
            ,html:`Tout vendre (${item.qty})`
        });
        
        node.appendChild(sellBtnQtyAll);
        
        sellBtnQtyAll.addEventListener('click',()=>{
            if(!this.trySellInSameTimeSlice(item))
                this.game.items.sell(dynaCartItem,item.qty);
        });       
        
    }
    
    
    miscAction(dynaCartItem){
        let item=dynaCartItem.getItem();
        let node=dynaCartItem.node.querySelector('.cpa_btn'); 
        node.innerHTML='';
        let qtyInp=dynaCartItem.node.querySelector('.cp_sellqty input');  
        
        // Bouton Utiliser
        let useBtnQty=TOOLS.createElement({
            attr:{
                class:`cp_usebtn btn`
            }
            ,html:'Utiliser'
        });
        
        node.appendChild(useBtnQty);
        
        useBtnQty.addEventListener('click',()=>{
            alert("USE");
        });
    }
    
    
    weaponAction(dynaCartItem){
        let item=dynaCartItem.getItem();
        let node=dynaCartItem.node.querySelector('.cpa_btn'); 
        node.innerHTML='';
        let qtyInp=dynaCartItem.node.querySelector('.cp_sellqty input');  
        
        // Bouton Utiliser
        let reloadBtn=TOOLS.createElement({
            attr:{
                class:`cp_reloadbtn btn`
            }
            ,html:'(Re)Charger'
        });
        
        node.appendChild(reloadBtn);
        
        reloadBtn.addEventListener('click',()=>{
            alert("RELOAD");
        });
    }
    
    deleteFromCart(dynaCartItem){
        
        let item=dynaCartItem.getItem();
        if(item.qty<=0){
            item.isToSell=false;
            dynaCartItem.node.parentNode.removeChild(dynaCartItem.node);
        }
    }

        
    
    
    
    
    
}// end of class