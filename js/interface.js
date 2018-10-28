class Interface{
    constructor(game){
        this.game=game;
        this.tool=Tools();
        this.body=document.querySelector('body');
        
    }
    
    init(){
        let handler=this.tool.createElement({
            attr:{
                id:'handler'
            }
        });
        // entete
        this.header=this.tool.createElement({
            attr:{
                id:'header'
            }
        });

        handler.appendChild(this.header);
        
        // menu gauche
        this.mainMenu=this.tool.createElement({
            attr:{
                id:'mainMenu'
            }
        });
        
        handler.appendChild(this.mainMenu);
        
        // main body
        this.main=this.tool.createElement({
            attr:{
                id:'main'
            }
        });
        
        handler.appendChild(this.main);
        
        this.body.appendChild(handler);
        
        this.bank();
        this.timer();
        this.citySelector();
        this.hud();
        this.market();
        this.cart();
        
        
    }
    
    humanizeTime(s){
        if(!s){
            console.log('humanizeTime : parametre manquant');
        }
        let tdd=new Date(s);
        return tdd.toLocaleDateString()+' '+tdd.toLocaleTimeString();
    }
    
    timer(){
        this.timerBox=this.tool.createElement({
            attr:{
                id:'timer'
            }
        });
        this.header.appendChild(this.timerBox);
        // premier affichage
        this.timerBox.innerHTML=this.userFriendlyTime(this.game.today);
        
        // toute les secondes on refresh
        this.game.timer.timerObserver.second.push(()=>{
            this.timerBox.innerHTML=this.userFriendlyTime();
        });
    }
    
    userFriendlyTime(mixedTime=false){
        if(!mixedTime){
            mixedTime=this.game.todayPosix;
        }
        let d=new Date(mixedTime);
        let conv=(n)=>this.tool.padWithZero(n);
        let date=conv((d.getDate()));
        let m=conv(d.getMonth());
        let y=conv(d.getYear()-100);
        let h=conv(d.getHours());
        let mi=conv(d.getMinutes());
        let s=conv(d.getSeconds());
        
        return `<span>${date}/${m}/${y}</span> <span>${h}:${mi}</span>`;
            
    }
    
    market(){
        
        if(!this.marketNode){
            this.marketNode=this.tool.createElement({
                attr:{
                    id:'marketbox'
                }
                ,html:`
                    <div id="marketselect"></div>
                    <div id="marketplace"></div>
                `
            });
            this.main.appendChild(this.marketNode);  
        }
        this.marketSelector();
        this.marketList();
        
        if(this.game.debug){
            this.debugParam();
        }
            
            
    }
    
    marketSelector(){
        
        this.activeMarket='drug';
        this.marketPlaces={
            drug:{
                displayName:'Marché noir'
                
            }
            ,misc:{
                displayName:'Carouf City'
                
            }
            ,weapon:{
                displayName:'Armurerie'
                
            }
        };
        
        let selectBar=this.marketNode.querySelector('#marketselect');
        let place=this.marketNode.querySelector('#marketplace');
        
        for(let marketType in this.marketPlaces){
            let market=this.marketPlaces[marketType];
            market.type=marketType;
            let activeClass=marketType===this.activeMarket?' active':'';
            
            // les sélecteurs 
            let sel=this.tool.createElement({
                attr:{
                    class:'m_goto'+activeClass
                }
                ,html:market.displayName
            });
            
            ((s,mt)=>{
                s.addEventListener('click',()=>{
                    if(mt!==this.activeMarket){
                        this.marketPlaces[this.activeMarket].placeNode.classList.remove('active');
                        selectBar.querySelector('.m_goto.active').classList.remove('active');
                        s.classList.add('active');
                        this.activeMarket=mt;
                        this.marketPlaces[this.activeMarket].placeNode.classList.add('active');
                        this.marketList();
                    }
                });
                
            })(sel,marketType);
            
            
            selectBar.appendChild(sel);
            
            // les conteneurs des marketList
            let cont=this.tool.createElement({
                attr:{
                    class:'mp_cont'+activeClass
                }
                ,html:market.displayName
            });
            market.placeNode=cont;
            place.appendChild(cont);
            
        }
    }
    
    bank(){
        if(!this.bankNode){
            this.bankNode=this.tool.createElement({
                attr:{
                    id:'bank'
                }
            });
            
            this.header.appendChild(this.bankNode);  
        }
        this.bankNode.innerHTML=`
            <div id="bankamnt">
                <span>${(this.game.current.money).toFixed(2)}</span>
                <span>Cr.</span>
            </div>
        `;
    }
    
    hud(){
        this.hudNode=this.tool.createElement({
            attr:{
                id:'hud'
            }
        });
        
        this.transportMenu();
        
        // les poches
        this.pockets=this.tool.createElement({
            attr:{
                id:'pockets'
                ,class:'hud_elem'
            }
            ,html:`
            ${getSVGIcon('pocket',{classe:'he_ico'})}
            <span id="pvgauge">
                <span id="pvamnt"></span>/<span id="pvtotal"></span>
            </span>`
        });
        this.hudNode.appendChild(this.pockets);
        this.refreshPocketVol();
        
        this.header.appendChild(this.hudNode);
        
        // la toolbox (arme et autre)
        this.toolbox=this.tool.createElement({
            attr:{
                id:'toolbox'
                ,class:'hud_elem'
            }
            ,html:`
            ${getSVGIcon('techandgun',{classe:'he_ico'})}
            <span id="tlgauge">
                <span id="tlamnt"></span>/<span id="tltotal"></span>
            </span>`
        });
        this.hudNode.appendChild(this.toolbox);
        this.refreshToolBoxVol();
        
        this.header.appendChild(this.hudNode);
    }
    
    transportMenu(){
        // le véhicule
        let transMenu=this.tool.createElement({
            attr:{
                id:'transpmenu'
            }
            ,html:'<div class="tm_curr"></div><div class="tm_choice"></div>'
        });
        let getCurrTrans=()=>this.game.transports.transports[this.game.current.transport];
        let tCurr=transMenu.querySelector('.tm_curr');
        let tChoice=transMenu.querySelector('.tm_choice');
        
        tCurr.addEventListener('click',()=>{
            transMenu.classList.toggle('active');
        });
        
        // on créer les sélecteurs de transport
        for(let tr in this.game.transports.transports){
            let trans=this.game.transports.transports[tr];
            let tIcon=getSVGIcon(trans.ico,{classe:'tm_ico'});
            
            // le transport actuel
            if(tr===this.game.current.transport){
                tCurr.innerHTML=tIcon;
            }
            
            // les achat de transport
            let buyHtml='';
            let inactiveClass='';
            if(!trans.active){
                let tBuyIcon=getSVGIcon(trans.ico,{classe:'tm_ico',fill:'#042502'});
                
                buyHtml=`
                    <div class="tmi_buytsp"><div class="tmi_buybtn btn">Acheter ${tBuyIcon} ${trans.price} Cr.</div>
                `;
                inactiveClass=' inactive';
            }
            
            // le temps de transport
            let C2Ctime=(trans.duration/60).toFixed(1);
            
            let tItem=this.tool.createElement({
                attr:{
                    class:'tm_item'+inactiveClass
                }
                ,html:`
                    ${tIcon}
                    
                    
                    <div class="tmi_info">
                        <span class="tmii_bonus">
                            ${getSVGIcon('chrono')}
                            ${C2Ctime}h
                        </span>
                        <span class="tmii_bonus">
                            ${getSVGIcon('pocket')}
                            +${trans.morePocket}
                        </span>
                    </div>
                    ${buyHtml}
                `
            });
            
            
            // ajout du click de sélection
            let addSelectTransp=(n,t)=>{
                n.addEventListener('click',()=>{
                    let ok=this.game.transports.changeTransport(t);
                    if(ok.status){
                        // on change l'icone
                        let newTrans=getCurrTrans();
                        let oldTrans=this.game.transports.transports[ok.old];
                        tCurr.querySelector('.ico').classList.replace('fa-'+oldTrans.ico,'fa-'+newTrans.ico);
                        this.refreshPocketVol();
                        this.refreshBuyAllBtn();
                        transMenu.classList.toggle('active');
                    }
                    else{
                        console.log(ok.reason);
                    }
                });
            }
            
            // bouton sélection du transport
            if(trans.active){
                addSelectTransp(tItem,tr);
            }
            // bouton achat transport
            else{
                let buyTransBtn=tItem.querySelector('.tmi_buybtn');
                
                ((n,tIt,t)=>{
                   n.addEventListener('click',(e)=>{
                      e.stopPropagation();
                      let bought=this.game.transports.buyTransport(t);
                      if(bought){
                          n.parentNode.removeChild(n);
                          tIt.classList.remove('inactive');
                          addSelectTransp(tIt,t);
                          this.bank();
                      }
                      else{
                          
                        // erreur
                        this.errorModal({reason:'money'});
                      }
                   });
                })(buyTransBtn,tItem,tr);
                
            }
            tChoice.appendChild(tItem);
        } // end loop transport
        
        
        
        this.hudNode.appendChild(transMenu);        
    }
    
    refreshPocketVol(amnt=this.game.current.pocketAmnt,total=this.game.getPocketCapacity()){
        let amntNode=this.pockets.querySelector('#pvamnt');
        
        amntNode.classList.remove('dryqty');
        if((total-amnt)<=5 && amnt>0){
            amntNode.classList.add('dryqty');
        }
        amntNode.innerHTML=amnt;
        this.pockets.querySelector('#pvtotal').innerHTML=total;
    }
    
    refreshToolBoxVol(amnt=this.game.current.weaponPocketAmnt,total=this.game.getWeaponPocketCapacity()){
        let amntNode=this.toolbox.querySelector('#tlamnt');
        
        amntNode.innerHTML=amnt;
        this.toolbox.querySelector('#tltotal').innerHTML=total;
    }
    
    
    citySelector(){
        let citiIcon=getSVGIcon('city');
        
        this.cityBox=this.tool.createElement({
            attr:{
                id:'cities'
            }
            ,html:`<div id="selcitybtn">${citiIcon}</div>`
        });
        let cities=this.game.cities.cities;
        for(let c in cities){
            
            // la classe active
            let cAct='';
            if(c==this.game.current.city){
                cAct+=' active';
            }
            
            // on créer le bouton
            let city=cities[c];
            let node=this.tool.createElement({
                attr:{
                    class:'gotocity'+cAct
                }
            });
            
            node.innerHTML=citiIcon+city.displayName;
            
            // au click sur un lien ville
            ((n,cityCode,cityObj)=>{
                n.addEventListener('click',()=>{
                    if(this.game.current.pocketAmnt<=this.game.getPocketCapacity()){
                        // on met à jour la ville, vers où on va
                        this.game.current.city=cityCode;
                        
                        // la popin de transport
                        let modal=this.modal({
                           title:'En route vers '+cityObj.displayName 
                        });
                        
                        let tCode=this.game.current.transport;
                        
                        let tData=this.game.transports.transports[tCode];
                        
                        let tIcon=`${tCode} fas fa-${tData.ico}`;
                        
                        // on avance dans le temps
                        let transport=this.game.timer.fastForward(tData.duration);
                        
                        
                        modal.body.innerHTML=`
                            <div id="transportstage">
                                <div class="fas fa-building"></div>
                                <div class="perso ${tIcon}"></div>
                                <div class="fas fa-building"></div>
                            </div>
                        `;
                        
                        transport.then(()=>{
                            modal.closeModal();
                            this.marketList();
                            this.cart();
                            let oldNode=this.cityBox.querySelector('.active');
                            oldNode.classList.remove('active');
                            // oldNode.removeChild(oldNode.querySelector('svg'));
                            n.classList.add('active');
                            // console.log(n.childNodes[0])
                            // n.parentNode.insertBefore(citiIcon,n.childNodes[0]);
                            
                            if(this.game.debug){
                                this.debugParam();
                            }
                        });
                        
                    }
                    // sinon trop lourd
                    else{
                        errorModal({reason:'weight'});
                    }
                });
                
            })(node,c,city);
            this.cityBox.appendChild(node);
        }
        this.mainMenu.appendChild(this.cityBox);
        // this.header.appendChild(this.cityBox);
    }
    
    modal(param=false){
        
        let title='';
        if(param.title && param.title.length)
            title=param.title;
        
        let closeBtnHTML='';
        let bottomClose='';
        if(param.closeBtn===true){
            closeBtnHTML='<div class="mch_close fas fa-times"></div>';
            bottomClose='<div class="mchb_close"><span class="btn">FERMER</span></div>';
        }
        
        let modal=this.tool.createElement({
            attr:{id:'modalhandler'}
            ,html:`
                <div class="modalcont">
                    <div class="mc_head">
                        <div class="mch_title">${title}</div>
                        ${closeBtnHTML}
                        
                    </div>
                    <div class="mc_body"></div>
                    ${bottomClose}
                
                </div>
            `
        });
        
        let closeModal=()=>{
            this.body.removeChild(modal);
        }
        
        if(closeBtnHTML.length){
            modal.querySelector('.mch_close').addEventListener('click',()=>{
                closeModal();
            });
            modal.querySelector('.mchb_close').addEventListener('click',()=>{
                closeModal();
            });
        }
        
        this.body.appendChild(modal);
        return {
            body:modal.querySelector('.mc_body')
            ,closeModal:closeModal
        }
    }
        
    debugParam(){
        let data=this.game.cities.getData();
        let box=document.querySelector('#paramdebug');
        if(!box){
            box=this.tool.createElement({
                attr:{
                    id:'paramdebug'
                }
            });
            
            this.body.appendChild(box);  
        }
        box.innerHTML='';
        for(let p in data){
            let n=this.tool.createElement();
            n.innerHTML='<div>'+p+' : '+data[p]+'</div>';
            box.appendChild(n);
        }
        
        console.log("DEBUG",data);
    }
    
    // erreurs communes
    errorModal(param){
        let errorBox=this.modal({
            title:'Dommage !'
            ,closeBtn:true
        });
        let msg='Une erreur est survenue';
        if(param.reason==='money'){
            msg=`Vous n'avez pas assez d'argent`;
        }
        if(param.reason==='space'){
            msg=`Vous n'avez pas assez de poche`;
        }
        if(param.reason==='weight'){
            msg=`Vous ne pouvez pas vous déplacer, vous êtes trop lourd, veuillez vendre ou vider vos poches`;
        }
        errorBox.body.innerHTML=msg;
    }    
    
    
    marketList(){
        let items=this.game.items.getAll();
        // vente authorisé uniquement sur le marché noir
        let authorizedSell=this.activeMarket!=='misc' && this.activeMarket!=='weapon';
        
        
        let sellCol='';
        if(authorizedSell)
            sellCol=`<div class="pl_sellprice">VENTE</div>`;
        
        
        let list=this.tool.createElement({
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
        
        this.buyAllBtns=[];
        // les codes produits ou type produits sans achat max
        this.noBuyAll=['backpack','service'];
        
        for(let d in items){
            let it=items[d];
            let itType=it.type;
            
            // ça prend dans les poches ?
            let isNotAGun=it.type==='weapon' && it.isAmmo || it.type!=='weapon';
            
            let hasBuyAllBtn=this.noBuyAll.indexOf(it.code)<0 && this.noBuyAll.indexOf(it.type)<0;
            
            // on construit le marché correspondant
            if(itType===this.activeMarket){
                let line=this.tool.createElement({
                    attr:{
                        class:'priceline'
                    }
                });


                // on va chercher les prix

                // prix d'achat pour tout sauf les armes

                let buyPrice=this.game.items.items[it.code].basePrice;
                if(itType!=='weapon'){
                    buyPrice=this.game.cities.getPrice(d,'buy');
                }

                // prix de vente (pas pour les boutiques, ni armurerie)
                let sellPrice='';
                if(authorizedSell){
                    sellPrice=this.game.cities.getPrice(d,'sell');
                }

                // CALCUL valeur Achat Max
                let buyAllAmnt=()=>{
                    try{
                        let ret={
                            amnt:0
                            ,what:'space'
                        };
                        if(isNotAGun){
                            if(it.pocketVol!==0){
                                ret.amnt=parseInt(((this.game.getPocketCapacity()-this.game.current.pocketAmnt)/it.pocketVol).toFixed(0));
                            }
                            else{
                                ret.amnt=0;
                            }
                        }
                        else{
                            ret.amnt=this.game.current.weaponPocketAmnt;
                        }
                        
                        // s'il reste des poches et qu'on a pas assez d'argent pour les remplir, on achète ce qu'on peux au max
                        let p=Math.floor(this.game.current.money/buyPrice);
                        if(ret.amnt > p){
                            ret.amnt=p;
                            ret.what='money';
                            
                        }
                        
                        
                        return ret;
                    }
                    catch(e){
                        console.log(e);
                    }
                };
                

                // colonne vente
                let sellCol='';
                if(authorizedSell)
                    sellCol=`<div class="pl_sellprice">${sellPrice}</div>`;

                // colonne taille
                let pRoomCol='<div class="pl_pockvol"></div>';
                if(isNotAGun)
                    pRoomCol=`<div class="pl_pockvol">${it.pocketVol}</div>`;
                
                let ico=getSVGIcon(it.gameIco,{
                   classe:'pl_icosvg' 
                });
                
                let buyAllBtnHTML='';
                let qtyReadOnly='';
                if(hasBuyAllBtn){
                    buyAllBtnHTML=`<div class="pl_buyall pl_buybtn btn">Ach. max (${buyAllAmnt().amnt})</div>`;
                }
                // achat à l'unité obligatoire
                else{
                    qtyReadOnly='readonly="readonly"';
                }     
                
                line.innerHTML=`
                    <div class="pl_ico">${ico}</div>
                    <div class="pl_name">${it.displayName}</div>

                    <div class="pl_buyprice">${buyPrice}</div>
                        ${sellCol}
                    <div class="pl_qty"><input type="type" value="1" ${qtyReadOnly}></div>
                    <div class="pl_unit">${it.unit}</div>
                    ${pRoomCol}
                    <div class="pl_buy">
                        <div class="pl_buyqty pl_buybtn btn">Acheter</div>
                    </div>
                    <div class="pl_buya">${buyAllBtnHTML}</div>
                `;

                ///////// Acheter la quantité
                let buyBtn=line.querySelector('.pl_buyqty');
                let qtyInp=line.querySelector('.pl_qty input');
                ((b,i,qi)=>{
                    b.addEventListener('click',()=>{

                        let ok=this.game.items.buy(i,parseInt(qi.value),parseFloat(buyPrice));
                        if(ok.status){
                            // refresh
                            this.game.UI.bank();
                            this.game.UI.cart();
                            this.game.UI.refreshPocketVol();
                            // recalcul des lignes achat Max
                            this.refreshBuyAllBtn();
                            
                            if(i.code==='backpack'){
                                line.parentNode.removeChild(line);
                                let m=this.modal({
                                    title:'BONUS DE POCHE !'
                                    ,closeBtn:true
                                });
                                m.body.innerHTML=`
                                    <div id="bonusbackpack">
                                        <div>${getSVGIcon('backpack',{classe:'bbpico'})}</div>
                                        <div class="bbbody">
                                            <div class="bbpbody">
                                            Vous avez acheté le sac à dos, vous bénéfiez d'un bonus permanent de 20 poches
                                            </div>
                                            <div class="bbppbody">
                                                ${getSVGIcon('pocket',{classe:'bbppico'})} +20
                                            </div>
                                        </div>
                                    </div>
                                
                                
                                `;
                            }
                            
                            return;
                        }
                        // erreur
                        this.errorModal(ok);
                    });

                })(buyBtn,it,qtyInp,line);

                ///////// Acheter le max selon argent
                if(hasBuyAllBtn){
                    let buyAllBtn=line.querySelector('.pl_buyall');
                    let that=this;
                    // stockage des lignes achat Max pour refresh ultérieur
                    this.buyAllBtns.push({node:buyAllBtn,cb:function(){
                        this.node.innerHTML=`Ach. max (${buyAllAmnt().amnt})`;
                    }});
                    
                    // au click
                    ((b,i)=>{
                        b.addEventListener('click',()=>{
                            // on va chercher le prix max achetable en fonction du total ET des poches
                            let qi=buyAllAmnt();
                            // si le montant possible est sup à 0
                            if(qi.amnt>0){
                                let ok=this.game.items.buy(i,qi.amnt,parseFloat(buyPrice));
                                if(ok){
                                    // refresh
                                    this.game.UI.bank();
                                    this.game.UI.cart();
                                    this.game.UI.refreshPocketVol();
                                    
                                    // on met le compteur à 0 pour ce bouton
                                    b.innerHTML='Ach. max (0)';
                                    // recalcul des lignes achat Max
                                    this.refreshBuyAllBtn();
                                    return;
                                }
                                // erreur
                                this.errorModal(ok);
                            }
                            
                            // erreur sur quoi on ne peut pas acheter
                            this.errorModal({reason:qi.what});
                        });

                    })(buyAllBtn,it);
                }
                
                // last call
                // on autorise ou pas l'affichage de la ligne
                let isOkLine=true;
                
                // Le sac à dos : 1 seule fois !
                if(it.code==='backpack' && this.game.current.hasBackPack)
                    isOkLine=false;
                
                if(isOkLine)
                    list.appendChild(line);
            }
             
        }
        this.marketPlaces[this.activeMarket].placeNode.innerHTML='';
        this.marketPlaces[this.activeMarket].placeNode.appendChild(list);
    }
    
    refreshBuyAllBtn(){
        for(let i=0;i<this.buyAllBtns.length;i++){
            this.buyAllBtns[i].cb();
        }
    }
    
    cart(){
        if(!this.cartNode){
            this.cartNode=this.tool.createElement({
                attr:{
                    id:'cart'
                }
            });
            
            this.main.appendChild(this.cartNode);  
        }
        
        this.cartNode.innerHTML=``;
        for(let i=0,len=this.game.current.cart.length;i<len;i++){
            
            // données produit
            let prod=this.game.current.cart[i];
            let prodBaseData=this.game.items.items[prod.code];
            
            // volume total
            let totalVol='';
            if(prodBaseData.pocketVol){
                let tv=prod.qty*prodBaseData.pocketVol;
                totalVol=`
                <div class="cp_weig">${getSVGIcon('pocket')} ${tv}</div>`;
            }
            
            // vente authorisée uniquement pour les drogues
            let authorizedSell=prod.type!=='misc' && prod.type!=='weapon';
            
            // nom de la ville
            let productCity=this.game.cities.cities[prod.city];
            let currentCity=this.game.cities.cities[this.game.current.city];
            let cityName=productCity.displayName;

            // date d'achat d'achat
            let d=this.userFriendlyTime(prod.buyTime);
            
            // Total crédits
            let totalCR=(prod.qty*prod.price).toFixed(2);
            
            // Bouton vente inactif sur la même tranche de temps dans la même ville
            let inactiveClass='';
            if(
                parseInt(prod.timestamp)===parseInt(this.game.current.timeSlice) 
                && prod.city===this.game.current.city
            ){
                inactiveClass=' inactive';
            }
            
            // classe du liseret coloré
            let cartPColor=` cp_cpc_${prod.type}`;
            
            // profit de vente 
            let profitCol='';
            if(authorizedSell){
                let currentTotal=currentCity.currentPrices.sell[prod.code]*prod.qty;
                let profit=(currentTotal-totalCR).toFixed(2);
                let pWay=profit<0?'neg':'pos';
                profitCol=`<div class="cp_profit">Profit : <span class="${pWay}">${profit} Cr.</span></div>`;
            }
            
            
            let pNode=this.tool.createElement({
                attr:{
                    class:'cart_prod'+cartPColor
                }
            });            
            pNode.innerHTML=`
                
                <div class="cp_phead">
                    <div class="cp_name">${prodBaseData.displayName} ${totalCR} Cr.</div>
                    <div class="cp_headaction">
                        <div class="cp_habtn cp_delfromcart fas fa-trash"></div>
                    </div>
                </div>
                
                <div class="cp_numbs">
                    <div class="cp_mon">${prod.qty} ${prodBaseData.unit} x ${prod.price} Cr.</div>
                    ${totalVol}
                </div>
                <div class="cp_info">
                    <div class="cp_cityname">${cityName}<br>${d}</div>
                    ${profitCol}
                </div>
                <div class="cp_action">
                    <div class="cp_sellqty">
                        <input type="text" value="1">
                    </div>
                    <div class="cpa_btn"></div>
                </div>
            `;

            let btnContainer=pNode.querySelector('.cpa_btn');
            let qtyInp=pNode.querySelector('.cp_sellqty input');
            
            
            let delBtn=pNode.querySelector('.cp_delfromcart');
            ((n,cartIndex)=>{
                n.addEventListener('click',()=>{
                    this.game.items.deleteFromCart(cartIndex);
                });
            })(delBtn,i);            
            
            if(prod.type==='misc'){
                
                // Bouton Utiliser
                let useBtnQty=this.tool.createElement({
                    attr:{
                        class:`cp_usebtn btn${inactiveClass}`
                    }
                    ,html:'Utiliser'
                });
                
                btnContainer.appendChild(useBtnQty);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        alert("USE");
                    });

                })(useBtnQty,qtyInp,i);
            }
            
            
            if(prod.type==='drug'){
                
                // Bouton vendre
                let sellBtnQty=this.tool.createElement({
                    attr:{
                        class:(`cp_sellbtn btn${inactiveClass}`)
                    }
                    ,html:'Vendre'
                });
                
                btnContainer.appendChild(sellBtnQty);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        if(!inactiveClass.length){
                            this.game.items.sell(parseInt(qi.value),cartIndex);
                            // recalcul des lignes d'achat
                            this.refreshBuyAllBtn();
                        }
                    });

                })(sellBtnQty,qtyInp,i);

                // bouton Tout Vendre
                let sellBtnQtyAll=this.tool.createElement({
                    attr:{
                        class:`cp_sellbtn btn${inactiveClass}`
                    }
                    ,html:`Tout vendre (${prod.qty})`
                });
                
                btnContainer.appendChild(sellBtnQtyAll);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        if(!inactiveClass.length){
                            this.game.items.sell(parseInt(qi),cartIndex);
                            // recalcul des lignes d'achat
                            this.refreshBuyAllBtn();
                        }
                    });

                })(sellBtnQtyAll,prod.qty,i);
                
                
            }
            

            
            this.game.current.cart[i].node=pNode;
            this.cartNode.appendChild(pNode);
        }
        
    }
}