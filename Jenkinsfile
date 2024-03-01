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

        def awsEksEcommerceDeployment = "ecommerce-ui"
        def kubectlConfigPath = "/home/joph/.kube/config"
        def kubectlDeploymentFileName = "deployment.yaml"
        def minikubeClientCrtPath = "/home/joph/.minikube/profiles/minikube/client.crt"
        def minikubeClientKeyPath = "/home/joph/.minikube/profiles/minikube/client.key"
        def minikubeCaCrtPath = "/home/joph/.minikube/ca.crt"

        def helmDeploymentName = "ecommerce-ui"
        def helmRepoDeploymentName = "ecommerce/ecommerce-ui"
        def helmValuesFileName = "values.yml"

        def localEnv = "local"
        def stagingEnv = "staging"

        def buildName = ""

        def tmpFolder = "test_$BUILD_NUMBER"
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
        stage("Docker") {
            steps {
                unstash 'scm'
                script {
                    buildName = "${env.BRANCH_NAME}.${env.GIT_COMMIT.take(7)}"
                    sh "echo ${buildName}"

                    dockerImage = docker.build("${dockerRepoName}:${buildName}", "-f ${dockerFile} .")
                    docker.withRegistry("${dockerRegistry}", dockerCredential) {
                        dockerImage.push()
                    }

                    dockerImageLatest = docker.build("${dockerRepoName}:latest", "-f ${dockerFile} .")
                    if (params.deployEnv == "${stagingEnv}") {
                        docker.withRegistry("${dockerRegistry}", dockerCredential) {
                            dockerImageLatest.push()
                        }
                    }
                }
            }
        }
        stage("Kubernetes") {
            steps {
                script {
                    if (params.deployEnv == "${stagingEnv}") {
                        sh "docker run -u root --rm --name kubectl -v ${kubectlConfigPath}:/.kube/config -e AWS_ACCESS_KEY_ID='${env.AWS_ACCESS_KEY_ID}' -e AWS_SECRET_ACCESS_KEY='${env.AWS_SECRET_ACCESS_KEY}' -e AWS_DEFAULT_REGION='${env.AWS_DEFAULT_REGION}' ${dockerKubectlAws} rollout restart deployment ${awsEksEcommerceDeployment}"
                    } else if(params.deployEnv == "${localEnv}") {
                        sh "docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} ${dockerKubectlAws} config use-context minikube"
                        sh '''#!/bin/bash
                            helm repo add ecommerce https://jophielv.github.io/ecommerce-helm-charts/
                            helm repo update ecommerce
                            if docker run --rm --name kubectl -u root --net=host -v ${kubectlConfigPath}:/.kube/config -v ${minikubeClientCrtPath}:${minikubeClientCrtPath} -v ${minikubeClientKeyPath}:${minikubeClientKeyPath} -v ${minikubeCaCrtPath}:${minikubeCaCrtPath} ${dockerKubectlAws} get deploy | grep ${awsEksEcommerceDeployment}
                            then
                            helm upgrade ${helmDeploymentName} ${helmRepoDeploymentName} --values ./helm/${helmValuesFileName} --set image.tag=${buildName} --kubeconfig /.kube/config
                            echo helm upgrade ${helmDeploymentName} ${helmRepoDeploymentName} --values ./helm/${helmValuesFileName} --set image.tag=${buildName} --kubeconfig /.kube/config
                            else
                            currDir=$(pwd)
                            size=${#currDir}
                            contextHostDirPrefix=/var/lib/docker/volumes/jenkins_home/_data
                            helm install ${helmDeploymentName} --values ./helm/${helmValuesFileName} ${helmRepoDeploymentName}
                            fi
                        '''
                    }
                }
            }
        }
        stage("Post - Cleanup") {
            steps {
                script {
                    if (params.deployEnv == "${stagingEnv}") {
                        sh "docker rmi ${dockerRepoName}:latest"
                        sh "docker rmi ${dockerRepoName}:${buildName}"
                        echo sh "docker rmi ${dockerRepoName}:${buildName}"
                        sh "docker rmi ${dockerRegistryNoProto}/${dockerRepoName}:${buildName}"
                        sh "docker rmi ${dockerRegistryNoProto}/${dockerRepoName}:latest"
                    }

                    sh "yes | docker image prune"
                }
            }
        }
    }
}
