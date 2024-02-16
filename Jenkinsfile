pipeline {
    agent any

    environment {
        def projectRepository = "https://github.com/JophielV/ecommerce-ui-react"
        def mavenImage = "maven:3.9.6-eclipse-temurin-11"
        def majorVersion = 1

        def dockerFile = "reactprod.dockerfile"
        def dockerApp = "docker-app" // Jenkins > Manage Jenkins > Tools > Docker
        def dockerCredential = "docker" // Jenkins > Manage Jenkins > Credentials
        def dockerRepoName = "jophielv/ecommerce-ui-prod-kub"
        def dockerImage = ""
        def dockerImageLatest = ""
        def dockerRegistry = "https://registry.hub.docker.com"
        def dockerRegistryNoProto = "registry.hub.docker.com"
        def dockerKubectlAws = "jophielv/kubectl-aws"

        def awsEksEcommerceDeployment = "ecommerce-ui-deployment"
        def kubectlConfigPath = "/home/joph/.kube/config"
        def kubectlDeploymentFileName = "deployment.yaml"
        def minikubeClientCrtPath = "/home/joph/.minikube/profiles/minikube/client.crt"
        def minikubeClientKeyPath = "/home/joph/.minikube/profiles/minikube/client.key"
        def minikubeCaCrtPath = "/home/joph/.minikube/ca.crt"

        def localEnv = "local"
        def stagingEnv = "staging"
    }

    parameters {
        choice(choices:["local", "staging"],
                description: "Which environment to deploy?",
                name: "deployEnv")
    }


    stages {
        stage("Clean Up") {
            steps {
                deleteDir()
            }
        }
        stage("Clone Repo") {
            steps {
                git url: "${projectRepository}", branch: "${env.BRANCH_NAME}"
                stash name:'scm', includes:'*'
            }
        }
        stage('Initialize Docker') {
            steps {
                script {
                    def dockerHome = tool "${dockerApp}"
                    env.PATH = "${dockerHome}/bin:${env.PATH}"
                }
            }
        }
        /*stage("Docker") {
            steps {
                unstash 'scm'
                script {
                    sh "echo ${dockerRepoName}:$BUILD_NUMBER"

                    dockerImage = docker.build("${dockerRepoName}:${majorVersion}.$BUILD_NUMBER", "-f ${dockerFile} .")
                    if (params.deployEnv == "${stagingEnv}") {
                        docker.withRegistry("${dockerRegistry}", dockerCredential) {
                            dockerImage.push()
                        }
                    }

                    dockerImageLatest = docker.build("${dockerRepoName}:latest", "-f ${dockerFile} .")
                    if (params.deployEnv == "${stagingEnv}") {
                        docker.withRegistry("${dockerRegistry}", dockerCredential) {
                            dockerImageLatest.push()
                        }
                    }
                }
            }
        }*/
        stage("Kubernetes") {
            steps {
                fileOperations([fileCopyOperation(
                        excludes: '',
                        flattenFiles: false,
                        includes: '/var/jenkins_home/workspace/merce-ui-react_build_and_jenkins/**',
                        targetLocation: "/tmp/test_jen"
                )])
                script {
                    if (params.deployEnv == "${stagingEnv}") {
                        sh "docker run -u root --rm --name kubectl -v ${kubectlConfigPath}:/.kube/config -e AWS_ACCESS_KEY_ID='${env.AWS_ACCESS_KEY_ID}' -e AWS_SECRET_ACCESS_KEY='${env.AWS_SECRET_ACCESS_KEY}' -e AWS_DEFAULT_REGION='${env.AWS_DEFAULT_REGION}' ${dockerKubectlAws} rollout restart deployment ${awsEksEcommerceDeployment}"
                    } else if(params.deployEnv == "${localEnv}") {
                        sh "docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} ${dockerKubectlAws} config use-context minikube"
                        sh "pwd"
                        sh "ls"
                        sh "readlink -f ${kubectlDeploymentFileName}"
                        sh '''
                           
                           
                        '''


                        /*sh '''
                            if docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} ${dockerKubectlAws} get deploy | grep ${awsEksEcommerceDeployment}
                            then
                            docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} ${dockerKubectlAws} rollout restart deployment ${awsEksEcommerceDeployment}
                            else
                            docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} -v /var/jenkins_home/workspace/merce-ui-react_build_and_jenkins/deployment.yaml:/deployment.yaml ${dockerKubectlAws} apply -f deployment.yaml
                            fi
                        '''*/
                    }
                }
            }
        }
        /*stage("Post - Cleanup") {
            steps {
                script {
                    sh "docker rmi ${dockerRepoName}:${majorVersion}.$BUILD_NUMBER"
                    sh "docker rmi ${dockerRepoName}:latest"

                    if (params.deployEnv == "${stagingEnv}") {
                        sh "docker rmi ${dockerRegistryNoProto}/${dockerRepoName}:${majorVersion}.$BUILD_NUMBER"
                        sh "docker rmi ${dockerRegistryNoProto}/${dockerRepoName}:latest"
                    }

                    sh "yes | docker image prune"
                }
            }
        }*/
    }
}
