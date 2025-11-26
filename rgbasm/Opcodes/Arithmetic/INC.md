**INC r  
INC (HL)**  
This instruction **INC**rements (adds) the operand (an 8-bit register) by one. In the case of **INC (HL)**, the 8-bit value at the memory location contained in register pair **HL** is incremented.  
Z: set according to result  
C: not affected  
N: reset (0)  
H: set according to result