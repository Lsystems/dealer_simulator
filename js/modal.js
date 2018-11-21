class Modal{
    constructor(game){
        this.game=game;
        this.body=document.querySelector('body');
        // abonnement des modales préprogrammées
        this.lib();
    }
    /* Pop a modal 
    
        param : object {
            title:'string'
            ,closeBtn:false
            
        }
        return object {
                body: domNode du corps
                ,closeModal: function : ferme la modal
        }
    */
    pop(param={title:'',closeBtn:false}){

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
                        <div class="mch_title">${param.title}</div>
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
        
        let setTitle=(title='')=>{
            modal.querySelector('.mch_title').innerHTML=title;
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
            ,setTitle:setTitle
        }
    }

    // la librairie des modales préprogrammées a déclencher sur les évènement communs
    lib(){
        // prop = nom de l'event
        let subs={
            notEnoughMoneyToBuy:{
                msg:`Vous n'avez pas assez d'argent`
                ,title:'Dommage !'
                ,closeBtn:true
                
            }
            ,notPocketMoneyToBuy:{
                msg:`Vous n'avez pas assez de poche`
                ,title:'Dommage !'
                ,closeBtn:true
                
            }
            ,itemOversell:{
                msg:`Vous ne pouvez pas vendre une telle quantité`
                ,title:'Dommage !'
                ,closeBtn:true
                
            }
            ,tooMuchWeight:{
                msg:`Vous ne pouvez pas vous déplacer, vous êtes trop lourd, veuillez vendre ou vider vos poches`
                ,title:'Dommage !'
                ,closeBtn:true
                
            }
            ,buyBackPack:{
                msg:`<div id="bonusbackpack">
                        <div>${getSVGIcon('backpack',{classe:'bbpico'})}</div>
                        <div class="bbbody">
                            <div class="bbpbody">
                            Vous avez acheté le sac à dos, vous bénéfiez d'un bonus permanent de 20 poches
                            </div>
                            <div class="bbppbody">
                                ${getSVGIcon('pocket',{classe:'bbppico'})}<span> +20</span>
                            </div>
                        </div>
                    </div>`
                ,title:'BONUS DE POCHE !'
                ,closeBtn:true
                
            }
            ,leaveCity:{
                msg:(d,m)=>{
                    return this.moveToCity(d,m);
                }
            }
        }
        for(let eventName in subs){
            let p=subs[eventName];
            this.game.obs.sub(eventName,(data=false)=>{
                
                let m=this.pop({
                    title:(p.title?p.title:'')
                    ,closeBtn:p.closeBtn
                });
                
                if(typeof p.msg==='function'){
                    p.msg(data,m);
                }
                if(typeof p.msg==='string'){
                    m.body.innerHTML=p.msg;
                }
            });
        }
    }
    
    moveToCity(data,modal){
        try{            
            modal.setTitle('En route vers '+data.cityName); 
            
            let tCode=this.game.current.transport;
            
            let tData=this.game.transports.transports[tCode];
            
            let tIcon=`${tCode} fas fa-${tData.ico}`;
            
            let html=`
                <div id="transportstage">
                    <div class="fas fa-building"></div>
                    <div class="perso ${tIcon}"></div>
                    <div class="fas fa-building"></div>
                </div>            
            `;            
            
            // on avance dans le temps
            let transport=this.game.timer.fastForward(tData.duration);
            
            
            transport.then(()=>{
                try{
                    modal.closeModal();
                    this.game.obs.trigger('enterCity');
                }
                catch(e){
                    TOOLS.log(e);
                }
            });
                                

            
            modal.body.innerHTML=html;
            
        }catch(e){
            TOOLS.log(e);
        }
    }
    
    
          
        // let msg='Une erreur est survenue';
        // if(param.reason==='money'){
        // }
        // if(param.reason==='space'){
        // }
        // if(param.reason==='weight'){
        // }
        // errorBox.body.innerHTML=msg;  
    
    
    
    
    
    
}