import { motion } from "framer-motion";
import {
    Search,
    ShoppingCart,
    Activity,
    Trophy
} from "lucide-react";

import styles from "./HowItWorks.module.css";


export default function HowItWorks(){


    const steps = [

        {
            number:"01",
            icon:<Search size={30}/>,
            title:"Escolha seu serviço",
            description:
            "Selecione o serviço ideal para seu objetivo: Elo Boost, Duo Boost, Coaching ou Placement."
        },

        {
            number:"02",
            icon:<ShoppingCart size={30}/>,
            title:"Faça seu pedido",
            description:
            "Informe seus dados, escolha seu objetivo e finalize sua solicitação com segurança."
        },

        {
            number:"03",
            icon:<Activity size={30}/>,
            title:"Acompanhe o progresso",
            description:
            "Monitore a evolução do serviço e acompanhe cada etapa do processo."
        },

        {
            number:"04",
            icon:<Trophy size={30}/>,
            title:"Alcance seu objetivo",
            description:
            "Receba seu resultado e continue evoluindo dentro do ranking nacional."
        }

    ];



    return(

        <section 
            id="how-it-works"
            className={styles.how}
        >

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
                        Como funciona
                    </span>


                    <h2>
                        Sua evolução em
                        <strong>
                            poucos passos
                        </strong>
                    </h2>


                    <p>
                        Um processo simples, seguro e transparente
                        para você alcançar seus objetivos.
                    </p>


                </motion.div>


                <div className={styles.steps}>

                    <div className={styles.line}></div>

                    {
                        steps.map((step,index)=>(


                            <motion.div

                                className={styles.card}

                                key={step.number}

                                initial={{
                                    opacity:0,
                                    y:50
                                }}

                                whileInView={{
                                    opacity:1,
                                    y:0
                                }}

                                viewport={{
                                    once:true
                                }}

                                transition={{
                                    delay:index * .15
                                }}

                            >

                                <span className={styles.number}>
                                    {step.number}
                                </span>


                                <div className={styles.icon}>
                                    {step.icon}
                                </div>


                                <h3>
                                    {step.title}
                                </h3>


                                <p>
                                    {step.description}
                                </p>


                            </motion.div>


                        ))
                    }


                </div>


            </div>


        </section>

    )

}