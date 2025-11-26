**ADD HL, rr**  
This instruction adds the contents of register pair _rr_ to register pair **HL**. _rr_ can be any of **BC, DE, HL, or SP**.  
Z: not affected  
C: set according to result  
N: reset (0)  
H: undefined  
  
  
**INC rr**  
This instruction increments the contents of register pair _rr_ by one. _rr_ can be any of **BC, DE, HL, or SP**.  
Z: not affected  
C: not affected  
N: not affected  
H: not affected  
  
  
**DEC rr**  
This instruction decrements the contents of register pair _rr_ by one. _rr_ can be any of **BC, DE, HL, or SP**.  
Z: not affected  
C: not affected  
N: not affected  
H: not affected  
  
Ok, so there isn't much that works with 16-bit numbers, this is because the GameBoy cpu is _8-bit_, and therefore works most efficiently with 8-bit numbers.