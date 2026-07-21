import { motion } from "framer-motion";
import {
    Gamepad2,
    Users,
    TrendingUp
} from "lucide-react";

import styles from "./Services.module.css";


export default function Services(){


    const services = [

        {
            icon:<Gamepad2 size={32}/>,
            title:"Evolução Gamer",
            description:
            "Melhore suas habilidades com acompanhamento, análise e estratégias personalizadas."
        },


        {
            icon:<Users size={32}/>,
            title:"Conexão de Times",
            description:
            "Encontre jogadores, equipes e oportunidades dentro do cenário competitivo."
        },


        {
            icon:<TrendingUp size={32}/>,
            title:"Performance",
            description:
            "Acompanhe sua evolução e descubra como alcançar novos níveis."
        }

    ];



    return(

        <section className={styles.services}>


            <div className={styles.container}>


                <motion.div

                    className={styles.header}

                    initial={{
                        opacity:0,
                        y:40
                    }}

                    whileInView={{
                        opacity:1,
                        y:0
                    }}

                    viewport={{
                        once:true
                    }}

                >

                    <span>
                        Nossos Serviços
                    </span>
                    <strong className={styles.highlight}></strong>

                    <h2>

                        Tudo que você precisa

                        <strong>
                            para evoluir
                        </strong>

                    </h2>


                    <p>

                        Uma plataforma criada para conectar,
                        desenvolver e destacar jogadores
                        dentro do universo gamer.

                    </p>


                </motion.div>





                <div className={styles.cards}>


                    {
                        services.map((service,index)=>(


                            <motion.div


                                className={styles.card}


                                key={service.title}


                                initial={{
                                    opacity:0,
                                    y:60
                                }}


                                whileInView={{
                                    opacity:1,
                                    y:0
                                }}


                                viewport={{
                                    once:true
                                }}


                                transition={{
                                    delay:index*.2
                                }}


                                whileHover={{
                                    y:-10
                                }}

                            >


                                <div className={styles.icon}>

                                    {service.icon}

                                </div>



                                <h3>

                                    {service.title}

                                </h3>



                                <p>

                                    {service.description}

                                </p>



                            </motion.div>


                        ))
                    }



                </div>



            </div>



        </section>

    )

}