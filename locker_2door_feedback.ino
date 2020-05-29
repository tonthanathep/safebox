#include <Wire.h> 
#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>

#define mqtt_server   "10.10.10.10"
#define mqtt_user     "Thanathep"
#define mqtt_password "1234567890"
#define mqtt_ID       "locker"

#define lockeroutput1 10
#define lockeroutput2 11
#define switch1 2
#define switch2 3

byte mac[] = {0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02};
EthernetClient ethClient;
PubSubClient client(ethClient);

void setup() 
{
  pinMode(lockeroutput1 , OUTPUT);
  pinMode(lockeroutput2 , OUTPUT);
  pinMode(switch1 , INPUT_PULLUP);
  pinMode(switch2 , INPUT_PULLUP);
  
  Ethernet.begin(mac);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  delay(5000);
}

void loop() 
{
  if (!client.connected()) 
  {
    delay(2000);
    client.connect(mqtt_ID,mqtt_user, mqtt_password);
    client.subscribe("locker1");
    client.subscribe("locker2");
    delay(5000);
  }
  
  client.loop();

  if(digitalRead(switch1) == LOW)
  {
    client.publish("switch1","Door 1 Opened");
    delay(200);
  }
  if(digitalRead(switch2) == LOW)
  {
    client.publish("switch2","Door 2 Opened");
    delay(200);
  }
}

void callback(char* topic, byte* payload, unsigned int length)
{
  String msg = "";
  int i=0;
  while (i<length) msg += (char)payload[i++];
  if(strcmp(topic,"locker1")==0)
  { 
    analogWrite(lockeroutput1,msg.toInt());
  }
  if(strcmp(topic,"locker2")==0)
  { 
    analogWrite(lockeroutput2,msg.toInt());
  }
}
