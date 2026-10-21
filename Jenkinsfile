pipeline {
    agent any

    stages {
        stage('Docker 이미지 빌드') {
            steps {
                echo 'Node.js 애플리케이션 이미지를 빌드합니다.'
                sh 'docker build -t my-node-app:latest .'
            }
        }

        stage('단위 테스트 실행 (CI)') {
            steps {
                echo '빌드된 컨테이너 내부에서 단위 테스트를 수행합니다.'
                sh 'docker run --rm my-node-app:latest npm test'
            }
        }

        stage('컨테이너 배포 (CD)') {
            steps {
                echo '기존 컨테이너를 교체하고 포트 8082로 신규 배포합니다.'
                sh '''
                    if [ $(docker ps -aq -f name=my-web-app-server) ]; then
                        docker rm -f my-web-app-server
                    fi
                    docker run -d --name my-web-app-server -p 8082:3000 --restart=always my-node-app:latest
                '''
            }
        }

        stage('헬스 체크 검증') {
            steps {
                echo '서비스 정상 기동 상태를 점검합니다.'
                sh 'sleep 5'
                sh 'docker ps -f name=my-web-app-server'
                sh 'docker exec my-web-app-server wget -qO- http://127.0.0.1:3000/health'
            }
        }
    }

    post {
        always {
            echo '파이프라인 실행이 완료되었습니다.'
        }
        success {
            echo '✅ 배포가 성공적으로 완료되었습니다!'
        }
        failure {
            echo '❌ 파이프라인 실행 중 오류가 발생했습니다.'
        }
    }
}
