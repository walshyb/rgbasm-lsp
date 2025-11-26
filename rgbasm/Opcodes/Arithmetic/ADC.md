**ADC A, r  
ADC A, n  
ADC A, (HL)**  
This is the **ADD** with _Carry_ instruction. It acts exactly like a standard ADD, including operands, except that it adds the contents of the single-bit _Carry_ flag to the result. Helpful for things like adding large numbers. 
Z: set according to result  
C: set according to result  
N: reset (0)  
H: set according to result