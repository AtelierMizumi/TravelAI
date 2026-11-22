package com.travelai.backend.booking;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class BankDataCipherTest {
    final BankDataCipher cipher=new BankDataCipher("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "");
    @Test void encryptsWithRandomNoncesAndBindsCiphertextToTheCard() {
        String a=cipher.encrypt("card-one","SIM-MC-synthetic"), b=cipher.encrypt("card-one","SIM-MC-synthetic");
        assertNotEquals(a,b);assertEquals("SIM-MC-synthetic",cipher.decrypt("card-one",a));
        assertThrows(IllegalStateException.class,()->cipher.decrypt("card-two",a));
    }
    @Test void codeIsNotRecoverableAndCannotBeReusedForAnotherCard() {
        String hash=cipher.verifier("one","007");assertTrue(cipher.matches("one","007",hash));
        assertFalse(cipher.matches("one","008",hash));assertFalse(cipher.matches("two","007",hash));
        assertFalse(hash.contains("007"));assertEquals(cipher.lookup("SIM-MC-synthetic"),cipher.lookup("SIM-MC-synthetic"));
    }
}
