#!/bin/bash
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs

sudo yum update -y
sudo yum install -y git
sudo yum install -y expect
sudo npm install pm2 -g

sudo yum install -y mariadb-server
echo "hello world"
sudo npm install -g uuid


#cd /Users/wangguangyu/Desktop/webapp || exit
#git clone git@github.com:GuangyuWang-NEU/webapp.git

#cd webapp || exit

#sudo npm install
sudo systemctl start mariadb
systemctl status mariadb.service
echo 'hello world2'
sudo systemctl enable mariadb
#expect -c 'spawn mysql_secure_installation; expect \"Enter current password for root (enter for none):\"; send \"\\r\"; expect \"Set root password?\"; send \"y\\r\"; expect \"New password:\"; send \"123456\\r\"; expect \"Re-enter new password:\"; send \"123456\\r\"; expect \"Remove anonymous users?\"; send \"y\\r\"; expect \"Disallow root login remotely?\"; send \"y\\r\"; expect \"Remove test database and access to it?\"; send \"y\\r\"; expect \"Reload privilege tables now?\"; send \"y\\r\"; interact;'
#echo $'\n Y\n 12345\n 12345\n Y\n Y\n Y\n Y\n' | sudo mysql_secure_installation

sudo mysql_secure_installation <<EOF

y
12345
12345
y
y
y
y
EOF


sudo mysql -uroot -p12345 <<EOF
CREATE DATABASE cloud;
quit
EOF

#sudo mysql_secure_installation
#mysql -uroot -p;

#sudo mysql -u root -p

#echo $'\n Y\n wang\n 60446201\n Y\n Y\n Y\n Y\n' | sudo mysql_secure_installation
#CREATE USER 'wang'@'localhost' IDENTIFIED BY '60446201';
#SET PASSWORD FOR 'wang'@'localhost' = PASSWORD'60446201';
#GRANT ALL PRIVILEGES ON *.* TO 'wang'@'localhost';
#FLUSH PRIVILEGES;


#node server.js

#chmod +x install-app.sh