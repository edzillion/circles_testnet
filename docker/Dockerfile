# All OS-, java- and android-stuff is handled here
FROM beevelop/android
# Most of the work
MAINTAINER Maik Hummel <m@ikhummel.com>
# Some little adaptations
MAINTAINER Ingo Beyerlein <ingo.beyerlein@allmaennitta.de>

#At least in the docker constellation 8.1 didn't work yet
#ENV NODEJS_VERSION=8.1.0
ENV NODEJS_VERSION=6.10.0 \
    CORDOVA_VERSION=7.0.1 \
    IONIC_VERSION=2.2.1 \
# Fork of Eds Repo
    GIT_REPO=https://github.com/allmaennitta/circles_testnet.git

ENV PATH=$PATH:/opt/node/bin

WORKDIR "/opt/node"

RUN apt-get update && \
    apt-get install -y curl ca-certificates git --no-install-recommends && \
    curl -sL https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.gz | tar xz --strip-components=1 && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

RUN npm install -g --unsafe-perm cordova@${CORDOVA_VERSION} ionic@${IONIC_VERSION}

WORKDIR "/var/app"

VOLUME /var/app
CMD ["sleep","10000"]
