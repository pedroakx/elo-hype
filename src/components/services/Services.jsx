import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Gamepad2,
    Users,
    TrendingUp
} from "lucide-react";

import styles from "./Services.module.css";


export default function Services(){


    const services = [

    {
        icon: <TrendingUp size={32} />,
        title: "Elo Boost",
        description:
            "Suba de elo com rapidez e segurança utilizando jogadores de alto nível.",
        link: "/services/elo-boost"
    },

    {
        icon: <Users size={32} />,
        title: "Duo Boost",
        description:
            "Jogue ao lado de um booster experiente e evolua enquanto acompanha cada partida.",
        link: "/services/duo-boost"
    },

    {
        icon: <Gamepad2 size={32} />,
        title: "Coaching",
        description:
            "Sessões personalizadas para melhorar mecânica, Macro Gaming e visão de jogo.",
        link: "/services/coaching"
    },

    {
        icon: <Gamepad2 size={32} />,
        title: "Placement",
        description:
            "Garanta as melhores partidas de colocação para começar a temporada no elo ideal.",
        link: "/services/placement"
    }

];



    return(

        <section 
        id="services"
        className={styles.services}>
            

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
                            para evoluir sua conta
                        </strong>

                    </h2>


                    <p>

                        Uma plataforma criada para facilitar e
                        desenvolver sua conta de forma prática e rápida.

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

                                <Link
                                    to={service.link}
                                className={styles.button}
>
                                 Saiba mais →
                                </Link>



                            </motion.div>


                        ))
                    }



                </div>



            </div>



        </section>

    )

}