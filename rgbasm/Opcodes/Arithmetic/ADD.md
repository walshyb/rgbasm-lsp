**ADD A, r  
ADD A, n  
ADD A, (HL)**  
This is the very simple **ADD** instruction. It basically adds the contents of register **A** with the second operand, and places the result in **A**. The second operand can be either an 8-bit register _r_, or a single byte of immediate data _n_, or a byte in memory addressed by the register pair **HL**.  
Flags affected are:  
Z: set according to result  
C: set according to result  
N: reset (0)  
H: set according to result

