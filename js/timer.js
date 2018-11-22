class Timer{
    constructor(game){
        this.game=game;
        this.delay=1000;
        
        // l'observer du timer
        this.timerObserver={
            second:[]
            ,day:[]
            ,month:[]
            ,year:[]
        };
        
    }
    
    getNextTimeSlice(){
        return (this.nextTimeSlice || this.game.current.timeSlice)+10800000;
    }
    
    start(){
        if(this.timeInterval){
            this.pause();
        }
        this.timeInterval=setInterval(()=>{
            if(!this.nextTimeSlice){
                this.nextTimeSlice=this.getNextTimeSlice();
            }
            this.game.todayPosix+=this.game.timerIncr();
            let d=new Date(this.game.todayPosix);
            
            // on execute les abonnements à l'observer du timer
            
            // les secondes à chaque fois
            
            this.game.obs.trigger("timer:second");

            // let oneTimeSlice=
            
            console.log(this.nextTimeSlice<this.game.todayPosix,this.nextTimeSlice,this.game.todayPosix);
            // la tranche de temps pour tout le jeu = 3h
            if(this.nextTimeSlice<this.game.todayPosix){
                this.nextTimeSlice=this.getNextTimeSlice();
                console.log('nextST')
                this.game.obs.trigger("timer:sliceTime");
                
            }

            // les jours
            if(d.getDate()!==this.game.current.day){
                this.game.obs.trigger("timer:day");
                this.game.current.day=d.getDate();
            }
            
            // les mois
            if(d.getMonth()!==this.game.current.month){
                this.game.obs.trigger("timer:month");
                this.game.current.month=d.getMonth();
            }
            
            // les années
            if(d.getFullYear()!==this.game.current.year){
                this.game.obs.trigger("timer:year");
                this.game.current.year=d.getFullYear();
            }
        },this.delay);
    }
    
    setDelay(ms){
        this.delay=ms;
        this.start();
    }
    
    /*
    @param toStop int : temps en minute dans le jeu
    */
    fastForward(toStop){
        if(toStop && toStop>0){
            let p=new Promise((res,rej)=>{
                toStop=toStop*60000; // min to ms
                
                // on sauvegarde la fonction d'incrément
                let incBU=this.game.timerIncr;
                // on sauvegarde le temps à ce moment
                let startTime=this.game.todayPosix;
                // on donne une nouvelle incrémentation= + 1min
                this.game.timerIncr=()=>60000;
                // toutes les 50 ms
                this.setDelay(50);
                
                // on s'abonne au passe plat de l'interval
                let aboId=this.game.obs.sub('timer:second',()=>{
                    let aT=this.game.todayPosix-startTime;
                    // si on est arrivé au temps escompté, on stop
                    if(aT>=toStop){
                        // on remet les valeurs par défaut du timer
                        this.game.timerIncr=incBU;
                        this.setDelay(1000);
                        
                        // on dégage l'abonnement
                        this.game.obs.unsub('timer:second',aboId);
                        res();
                    }
                });
            });
            return p;
        }
    }
    
    pause(){
        clearInterval(this.timeInterval);
    }
      
}