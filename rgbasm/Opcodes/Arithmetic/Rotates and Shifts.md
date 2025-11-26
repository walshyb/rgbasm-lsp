**SRA r or (HL)**  
Shift Right Arithmetically. This instruction shifts either register _r_ or the byte located at the address in **HL** right one bit, placing bit 0 into the _Carry_ flag, and leaving bit 7 untouched.  
![SRA r or (HL)](http://gameboy.mongenel.com/dmg/images/sra.gif)  
Z: set according to result  
C: set according to result  
N: reset (0)  
H: reset (0)