class Interface{
    constructor(game){
        this.game=game;
        
        this.body=document.querySelector('body');
        
    }
    
    init(){
        // le cadre principal, fixed full page
        let handler=TOOLS.createElement({
            attr:{
                id:'handler'
            }
        });
        
        // entete
        this.header=TOOLS.createElement({
            attr:{
                id:'header'
            }
        });

        handler.appendChild(this.header);
        
        // menu gauche
        this.mainMenu=TOOLS.createElement({
            attr:{
                id:'mainMenu'
            }
        });
        
        handler.appendChild(this.mainMenu);
        
        // main body
        this.main=TOOLS.createElement({
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
        this.timerBox=TOOLS.createElement({
            attr:{
                id:'timer'
            }
            ,html:`
                <div class="t_current"></div>
                <div class="t_next"></div>
            `
        });
        this.header.appendChild(this.timerBox);
        // premier affichage
        let tCurrNode=this.timerBox.querySelector('.t_current');
        let tNextNode=this.timerBox.querySelector('.t_next');
        
        tCurrNode.innerHTML=this.game.userFriendlyTime();
        tNextNode.innerHTML=this.game.userFriendlyTime(this.nextTimeSlice);
        
        // toute les secondes on refresh
        this.game.obs.sub('timer:second',()=>{
            tCurrNode.innerHTML=this.game.userFriendlyTime();
        });
        
        // toute les timeslice on refresh
        this.game.obs.sub('timer:sliceTime',(nts)=>{
            tNextNode.innerHTML=this.game.userFriendlyTime(nts);
        });
    }
    

    
    cart(){
        this.game.cart.init();
            
    }
    market(){
        this.game.market.init();
            
    }
    

    
    bank(){
        if(!this.bankNode){
            this.bankNode=TOOLS.createElement({
                attr:{
                    id:'bank'
                }
            });
            
            this.header.appendChild(this.bankNode);
            this.game.obs.sub('buyItem',()=>{this.bank()});
            this.game.obs.sub('sellItem',()=>{this.bank()});
        }
        this.bankNode.innerHTML=`
            <div id="bankamnt">
                <span>${(this.game.current.money).toFixed(2)}</span>
                <span>Cr.</span>
            </div>
        `;
    }
    
    hud(){
        this.hudNode=TOOLS.createElement({
            attr:{
                id:'hud'
            }
        });
        
        // menu transport
        this.transportMenu();
        
        // les poches
        this.pockets();
        
        // la toolbox (arme et autre)
        this.toolbox=TOOLS.createElement({
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
        let transMenu=TOOLS.createElement({
            attr:{
                id:'transpmenu'
            }
            ,html:'<div class="tm_curr"></div><div class="tm_choice"></div>'
        });
        let getCurrTrans=()=>this.game.transports.transports[this.game.current.transport];
        let tCurr=transMenu.querySelector('.tm_curr');
        let tChoice=transMenu.querySelector('.tm_choice');
        
        // ouvre/ferme le menu
        tCurr.addEventListener('click',()=>{
            transMenu.classList.toggle('active');
        });
        
        // on créer les sélecteurs de transport
        for(let tr in this.game.transports.transports){
            let trans=this.game.transports.transports[tr];
            let tIcon=getSVGIcon(trans.ico,{classe:'tm_ico'});
            
            // le transport actuel
            let actualClass='';
            if(tr===this.game.current.transport){
                actualClass=' actual';
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
            
            //le sélecteur
            let tItem=TOOLS.createElement({
                attr:{
                    class:'tm_item'+inactiveClass+actualClass
                }
                ,html:`
                    ${tIcon}
                    
                    <div class="tmi_info">
                        <span class="tmii_bonus">
                            ${getSVGIcon('chrono')}
                            <span>${C2Ctime}h</span>
                        </span>
                        <span class="tmii_bonus">
                            ${getSVGIcon('pocket')}
                            <span>+${trans.morePocket}</span>
                        </span>
                    </div>
                    ${buyHtml}
                `
            });
            
            
            // ajout du click de sélection d'un transport
            let addSelectTransp=(n,t)=>{
                n.addEventListener('click',()=>{
                    try{
                        this.game.obs.trigger("changeTransport",t);
                        this.game.obs.sub("enterTransport",()=>{
                            console.log('enterTransport UI')
                            // on change l'icone
                            let newTrans=getCurrTrans();
                            tCurr.innerHTML=getSVGIcon(newTrans.ico,{classe:'tm_ico'});
                        },{noRepeat:true});
                    }
                    catch(e){
                        TOOLS.log(e);
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
    
    pockets(amnt=this.game.current.pocketAmnt,total=this.game.getPocketCapacity()){
        if(!this.pocketsNode){
            this.pocketsNode=TOOLS.createElement({
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
            this.hudNode.appendChild(this.pocketsNode);
            
            this.game.obs.sub('buyItem',()=>this.pockets());
            this.game.obs.sub('sellItem',()=>this.pockets());
        }
        
        // update
        let amntNode=this.pocketsNode.querySelector('#pvamnt');
        
        amntNode.classList.remove('dryqty');
        if((total-amnt)<=5 && amnt>0){
            amntNode.classList.add('dryqty');
        }
        amntNode.innerHTML=amnt;
        this.pocketsNode.querySelector('#pvtotal').innerHTML=total;
        
        this.game.obs.sub('buyBackPack',()=>{this.pockets},{noRepeat:true});
    }
    
    refreshToolBoxVol(amnt=this.game.current.weaponPocketAmnt,total=this.game.getWeaponPocketCapacity()){
        let amntNode=this.toolbox.querySelector('#tlamnt');
        
        amntNode.innerHTML=amnt;
        this.toolbox.querySelector('#tltotal').innerHTML=total;
    }
    
    
    citySelector(){
        let citiIcon=getSVGIcon('city');
        
        this.cityBox=TOOLS.createElement({
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
            let node=TOOLS.createElement({
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
                        
                        // on quitte la ville
                        this.game.obs.trigger('leaveCity',{
                            cityName:cityObj.displayName
                            ,cityCode:cityCode
                        });
                        
                        // quand on entre dans l'autre ville, on refresh l'affichage du sélecteur de ville
                        this.game.obs.sub('enterCity',()=>{
                            let oldNode=this.cityBox.querySelector('.active');
                            oldNode.classList.remove('active');
                            n.classList.add('active');
                        },{noRepeat:true});
                    }
                    // sinon trop lourd
                    else{
                        this.game.obs.trigger('tooMuchWeight');
                    }
                });
                
            })(node,c,city);
            this.cityBox.appendChild(node);
        }
        this.mainMenu.appendChild(this.cityBox);
        // this.header.appendChild(this.cityBox);
    }
 /*    
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
        
        let modal=TOOLS.createElement({
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
 */
       

    
  
}