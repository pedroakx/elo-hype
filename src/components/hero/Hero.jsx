import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";

import styles from "./Hero.module.css";
import logo from "../../assets/images/elohypelogo.png";


export default function Hero(){


    const stats = [
        {
            icon:<Trophy size={22}/>,
            number:"500+",
            text:"Jogadores evoluídos"
        },

        {
            icon:<Users size={22}/>,
            number:"50+",
            text:"Times atendidos"
        },

        {
            icon:<Zap size={22}/>,
            number:"24/7",
            text:"Suporte gamer"
        }
    ];



    return(

        <section className={styles.hero}>


            <div className={styles.backgroundGlow}></div>



            <div className={styles.container}>


                {/* TEXTO */}

                <motion.div

                    className={styles.content}

                    initial={{
                        opacity:0,
                        x:-60
                    }}

                    animate={{
                        opacity:1,
                        x:0
                    }}

                    transition={{
                        duration:.8
                    }}

                >


                    <span className={styles.badge}>

                        🚀 A nova era dos gamers

                    </span>



                    <h1 className={styles.title}>

    Evolua seu jogo.

    <span>
        Domine o próximo nível.
    </span>

</h1>



                    <p className={styles.description}> 

                        A Elo Hype conecta jogadores,
                        equipes e oportunidades dentro
                        do universo competitivo.

                        Melhore sua performance,
                        encontre seu time e destaque
                        seu talento.

                    </p>



                    <div className={styles.actions}>


                        <a href="#services" className={styles.primary}>

                            Começar Agora

                            <ArrowRight size={18}/>

                        </a>



                        <a href="#how-it-works" className={styles.secondary}>

                            Conhecer a plataforma

                        </a>


                    </div>



                </motion.div>






                {/* LOGO */}

                <motion.div

                    className={styles.visual}

                    initial={{
                        opacity:0,
                        scale:.8
                    }}

                    animate={{
                        opacity:1,
                        scale:1
                    }}

                    transition={{
                        duration:1
                    }}

                >

                    <div className={styles.logoGlow}></div>


                    <img
                        src={logo}
                        alt="Elo Hype"
                    />


                </motion.div>


            </div>





            {/* STATS */}

            <div className={styles.stats}>

                {
                    stats.map((item)=>(


                        <motion.div

                            className={styles.card}

                            key={item.text}

                            whileHover={{
                                y:-8
                            }}

                        >

                            {item.icon}


                            <strong>
                                {item.number}
                            </strong>


                            <span>
                                {item.text}
                            </span>


                        </motion.div>


                    ))
                }


            </div>



        </section>

    )

}