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

        stage('데이터베이스 및 네트워크 준비') {
            steps {
                echo '도커 네트워크 및 PostgreSQL 컨테이너를 구동합니다.'
                sh '''
                    # 네트워크가 없으면 생성
                    docker network inspect app-net >/dev/null 2>&1 || docker network create app-net

                    # DB 컨테이너가 없으면 실행 (이미 실행 중이면 유지하여 데이터 보존)
                    if [ ! $(docker ps -q -f name=my-postgres-db) ]; then
                        docker run -d --name my-postgres-db \
                          --network app-net \
                          -e POSTGRES_USER=admin \
                          -e POSTGRES_PASSWORD=password123 \
                          -e POSTGRES_DB=study_db \
                          -v pgdata:/var/lib/postgresql/data \
                          --restart=always \
                          postgres:15-alpine
                    fi
                '''
            }
        }

        stage('API 컨테이너 배포 (CD)') {
            steps {
                echo '기존 앱 컨테이너를 교체하고 네트워크에 연결해 배포합니다.'
                sh '''
                    if [ $(docker ps -aq -f name=my-web-app-server) ]; then
                        docker rm -f my-web-app-server
                    fi
                    docker run -d --name my-web-app-server \
                      --network app-net \
                      -p 8082:3000 \
                      -e DB_HOST=my-postgres-db \
                      -e DB_USER=admin \
                      -e DB_PASSWORD=password123 \
                      -e DB_NAME=study_db \
                      --restart=always \
                      my-node-app:latest
                '''
            }
        }

        stage('헬스 체크 및 DB 검증') {
            steps {
                echo '서비스 정상 기동 및 DB 연결 상태를 점검합니다.'
                sh 'sleep 5'
                sh 'docker ps -f name=my-web-app-server'
                sh 'docker exec my-web-app-server wget -qO- http://127.0.0.1:3000/health'
            }
        }
    }

    post {
        success {
            echo '✅ DB 연동 애플리케이션 배포가 완료되었습니다!'
        }
        failure {
            echo '❌ 파이프라인 실행 중 오류가 발생했습니다.'
        }
    }
}
