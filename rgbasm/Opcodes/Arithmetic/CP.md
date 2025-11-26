**CP r  
CP n  
CP (HL)  
**This instruction **C**om**P**ares the operand with the contents of the _accumulator_ by subtracting the operand from the _accumulator_. This instruction differs from the **SUB** instruction in that the contents of **A** aren't changed, only the flags.  
Z: set according to result  
C: set according to result  
N: set (1)  
H: set according to result  
  
**NOTE:** this instruction DOES NOT have a destination specified because it is implied as ALWAYS being register **A**.