**LD A, ($3FFF)**  
This instruction loads the accumulator (register A) from memory location $3FFF.

**LD SP, ($4050)**  
This instruction loads the _Stack Pointer_ from memory locations $4050 (least significant byte) and $4051 (most significant byte). All subsequent stack operations such as **PUSH** or **POP** will be located at that new address loaded from that loacation, EG.. if at $4050 the data was $00 and at $4051 was $C4, then the _Stack Pointer_ will contain $C400 and all stack operations will happen there. Notice how the less significant byte of a 16-bit address is stored at the LOWER address.